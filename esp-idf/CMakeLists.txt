cmake_minimum_required(VERSION 3.16)

# set(EXTRA_COMPONENT_DIRS /home/catRoman/esp/esp-idf-lib/components)

set(PROJECT_VER "0.1.")

include($ENV{IDF_PATH}/tools/cmake/project.cmake)
project(little_lisa_greenhouse_proto)


# Define the output binary name including the version
set(target_name "${CMAKE_PROJECT_NAME}-${PROJECT_VER}")

# Custom command to copy and rename the binary after build
add_custom_command(TARGET ${CMAKE_PROJECT_NAME}.elf POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E rename
            ${CMAKE_BINARY_DIR}/little_lisa_greenhouse_proto.bin
            ${CMAKE_BINARY_DIR}/${target_name}.bin
    COMMENT "Renaming the output binary to include the version number"
)