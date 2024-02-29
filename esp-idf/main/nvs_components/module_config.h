
typedef enum Sensor_List{
    TEMP,
    HUMIDITY,
    SOIL_MOISTURE,
    LIGHT,
    SOUND,
    MOVEMENT,
    CAMERA,
    SENSOR_LIST_TOTAL
}Sensor_List;



void initiate_sensor_tasks(void);

void initiate_config(void);