set(MiniBrowser_DIR "${TOOLS_DIR}/MiniBrowser/efl")

# Elementary is needed to build MiniBrowser
find_package(Eldbus ${EFL_REQUIRED_VERSION} ${EFL_CONFIG_MODE})
find_package(Elementary ${EFL_REQUIRED_VERSION} ${EFL_CONFIG_MODE})
find_package(Ethumb ${EFL_REQUIRED_VERSION} ${EFL_CONFIG_MODE})
find_package(EthumbClient ${EFL_REQUIRED_VERSION} ${EFL_CONFIG_MODE})

set(MiniBrowser_SOURCES
    ${MiniBrowser_DIR}/main.c
)

set(MiniBrowser_INCLUDE_DIRECTORIES
    ${CAIRO_INCLUDE_DIRS}
    ${DERIVED_SOURCES_WEBKIT2_DIR}/include
    ${ECORE_INCLUDE_DIRS}
    ${ECORE_EVAS_INCLUDE_DIRS}
    ${ECORE_CON_INCLUDE_DIRS}
    ${ECORE_FILE_INCLUDE_DIRS}
    ${ECORE_IMF_INCLUDE_DIRS}
    ${ECORE_INPUT_INCLUDE_DIRS}
    ${EDJE_INCLUDE_DIRS}
    ${EET_INCLUDE_DIRS}
    ${EO_INCLUDE_DIRS}
    ${DBUS_INCLUDE_DIRS}
    ${EFREET_INCLUDE_DIRS}
    ${EINA_INCLUDE_DIRS}
    ${ELDBUS_INCLUDE_DIRS}
    ${ELEMENTARY_INCLUDE_DIRS}
    ${ETHUMB_INCLUDE_DIRS}
    ${ETHUMB_CLIENT_INCLUDE_DIRS}
    ${EVAS_INCLUDE_DIRS}
    ${WEBKIT2_DIR}/UIProcess/API/efl
    ${WEBKIT2_DIR}
    ${CMAKE_SOURCE_DIR}/Source
)

set(MiniBrowser_LIBRARIES
    JavaScriptCore
    WebCore
    WebKit2
    ${CAIRO_LIBRARIES}
    ${ECORE_LIBRARIES}
    ${ECORE_EVAS_LIBRARIES}
    ${ECORE_FILE_LIBRARIES}
    ${EDJE_LIBRARIES}
    ${EET_LIBRARIES}
    ${EINA_LIBRARIES}
    ${ELEMENTARY_LIBRARIES}
    ${EO_LIBRARIES}
    ${EVAS_LIBRARIES}
    ${FONTCONFIG_LIBRARIES}
    ${GLIB_LIBRARIES}
    ${GLIB_GTHREAD_LIBRARIES}
    ${LIBSOUP_LIBRARIES}
    ${LIBXML2_LIBRARIES}
    ${LIBXSLT_LIBRARIES} -lm
    ${OPENGL_LIBRARIES}
    ${SQLITE_LIBRARIES}
)

if (ELEMENTARY_FOUND)
    include_directories(${MiniBrowser_INCLUDE_DIRECTORIES})
    add_executable(MiniBrowser ${MiniBrowser_SOURCES})
    target_link_libraries(MiniBrowser ${MiniBrowser_LIBRARIES})
    set_target_properties(MiniBrowser PROPERTIES FOLDER "Tools")
endif ()
