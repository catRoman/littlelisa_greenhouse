/* ESP-IDF 5 SD_MMC Example
  *
  * This example opens Sqlite3 databases from SD Card and retrieves data from them.
  * Before running please copy following files to SD Card:
  * data/mdr512.db
  * data/chinook.db
  *
  * I could not open with ESP32 the file census2000names.db from the original example, so I search a SQLite3 sample.
  *
  * This is adaptation from siara-cc examples (https://github.com/siara-cc/esp32-idf-sqlite3-examples)
  * for it to work on ESP-IDF v5.X.X
*/
#include <stdio.h>
#include <string.h>
#include <sys/unistd.h>
#include <sys/stat.h>
#include <fcntl.h>
#include "esp_err.h"
#include "esp_log.h"
#include "esp_timer.h"
#include "esp_vfs_fat.h"
#include "driver/sdmmc_host.h"
#include "driver/sdspi_host.h"
#include "sqlite3.h"
#include "sdmmc_cmd.h"

//componenets
#include "spi_sd_card.h"

static const char *TAG = "sqlite3_sdspi";
const char* data = "Callback function called";

sqlite3 *db1;
sqlite3 *db2;
int rc;
char *zErrMsg = 0;

/**
  * @brief  SQLite Callback Function
  *
  * This function is a callback used with SQLite queries to process the results. It prints the
  * values of the result set columns, including their names and data, and an optional custom message.
  *
  * @param data - A pointer to optional custom data (can be NULL).
  * @param argc - The number of columns in the result set.
  * @param argv - An array of strings containing the values of the result set's columns.
  * @param azColName - An array of strings containing the names of the columns in the result set.
  *
  * @return
  * - 0 to indicate success.
  *
  * @note
  * - The `data` parameter can be used to pass an optional custom message or data.
  * - This function is typically used as a callback for SQLite query execution.
*/
static int callback(void *data, int argc, char **argv, char **azColName) {
    int i;

    // Print the custom message
    printf("%s: \n", (const char*)data);

    // Loop through the result set columns and print their names and values
    for (i = 0; i<argc; i++){
        printf("%s = %s\n", azColName[i], argv[i] ? argv[i] : "NULL");
    }

    // Print a newline character to separate rows
    printf("\n");
    return 0;
}

/**
 * @brief Open a SQLite database.
 *
 * This function opens a SQLite database specified by the filename and provides an SQLite
 * database connection object for further database operations.
 *
 * @param filename - The name of the database file to open.
 * @param db - A pointer to a pointer to an SQLite database connection object. Upon success,
 *             this pointer will store the reference to the opened database.
 *
 * @return
 *  - 0 on success, indicating the database was opened successfully.
 *  - A non-zero error code if there was an issue opening the database.
 *
 * @note
 * It is the responsibility of the caller to handle errors appropriately based on the
 * return value.
 *
 * @see sqlite3_open
 */
int openDb(const char *filename, sqlite3 **db) {
    int rc = sqlite3_open(filename, db);
    if (rc) {
        printf("Can't open database: %s\n", sqlite3_errmsg(*db));
        return rc;
    } else {
        printf("Opened database successfully\n");
    }
    return rc;
}

/**
 * @brief Execute an SQL statement on an SQLite database.
 *
 * This function executes the provided SQL statement on the specified SQLite database
 * and optionally calls a callback function to process the results. It also measures
 * the execution time and provides error handling.
 *
 * @param db - A pointer to the SQLite database connection.
 * @param sql - The SQL statement to be executed.
 *
 * @return
 *  - SQLITE_OK (0) on success, indicating the operation was completed successfully.
 *  - An SQLite error code on failure.
 *
 * @note
 * - The function provides timing information to measure the execution time of the SQL statement.
 * - Error handling is performed, and any SQL errors are printed along with timing information.
 * - The provided `sql` parameter should be a well-formed SQL statement.
 * - The `callback` function, if specified, processes the results of the SQL query.
 */
int db_exec(sqlite3 *db, const char *sql) {
    printf("%s\n", sql);
    int64_t start = esp_timer_get_time();
    int rc = sqlite3_exec(db, sql, callback, (void*)data, &zErrMsg);
    if (rc != SQLITE_OK) {
        // Print SQL error message
        printf("SQL error: %s\n", zErrMsg);
        // Free the error message string
        sqlite3_free(zErrMsg);
    } else {
        printf("Operation done successfully\n");
    }
    // Print execution time
    printf("Time taken: %lld\n", esp_timer_get_time()-start);
    return rc;
}


/**
 * @brief Select Data from both Databases
 *
 * This function performs SQL SELECT operations to retrieve data from two separate SQLite
 * databases. It handles any errors that may occur during the retrieval process.
 *
 * @note
 * - If an error occurs during data retrieval, both database connections are closed, and
 *   the function returns without completing the second SELECT operation.
 */
void select_data(){
    rc = db_exec(db1, "Select * from albums where AlbumId < '10'");
    if (rc != SQLITE_OK) {
        sqlite3_close(db1);
        //sqlite3_close(db2);
        return;
    }

    rc = db_exec(db2, "Select * from domain_rank where domain = 'zoho.com'");
    if (rc != SQLITE_OK) {
        sqlite3_close(db1);
        sqlite3_close(db2);
        return;
    }
}

void sd_db_task(void *vpParam){

    ESP_LOGI(TAG, "Initializing SD card");



    struct stat st;
    if(stat("/sdcard/chinook.db", &st) == 0){
        printf("/sdcard/chinook.db exists\n");
    }else{
        printf("/sdcard/chinook.db does not exists\n");
    }

    if(stat("/sdcard/mdr512.db", &st) == 0){
        printf("/sdcard/mdr512.db exists\n");
    }else{
        printf("/sdcard/mdr512.db does not exists\n");
    }


    sqlite3_initialize();

    // Open database 1
    // if (openDb("/sdcard/census2000names.db", &db1))
    //     return;
    ESP_LOGI(TAG, "Opening db chinook");
    if (openDb("/sdcard/chinook.db", &db1))
        return;
    // // Open database 2
     ESP_LOGI(TAG, "Opening db mdr512");
     if (openDb("/sdcard/mdr512.db", &db2))
         return;

    // Selecting data
    select_data();

    // Close SQLite databases.
    sqlite3_close(db1);
    // sqlite3_close(db2);
    extern sdmmc_card_t *card;
    // All done, unmount partition and disable SDMMC or SPI peripheral
    esp_vfs_fat_sdcard_unmount("/sd", card);
    ESP_LOGI(TAG, "Card unmounted");
   //while(1);

   vTaskDelete(NULL);
}
void sd_db_init(){
    xTaskCreatePinnedToCore(
        sd_db_task,
        "sd_db_test",
        8192,
        NULL,
        5,
        NULL,
        1
    );
}