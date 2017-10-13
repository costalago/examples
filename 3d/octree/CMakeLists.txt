cmake_minimum_required(VERSION 3.6)
project(prueba)

set(SOURCE_FILES

        main.cpp
        Camera.cpp
        Camera.hpp

        entity/Entity.cpp
        entity/Entity.hpp
        entity/Cube.cpp
        entity/Cube.hpp
        entity/Chunk.cpp
        entity/Chunk.hpp
        entity/CubeWires.cpp
        entity/CubeWires.hpp
        entity/Voxels.cpp
        entity/Voxels.hpp

        svo/VoxelOctree.cpp
        svo/VoxelOctree.hpp
        svo/VoxelData.cpp
        svo/VoxelData.hpp
        svo/ChunkedAllocator.hpp
        svo/Debug.cpp
        svo/Debug.hpp
        svo/Util.cpp
        svo/Util.hpp
        svo/IntTypes.hpp
        svo/Timer.hpp

#        svo/thread/TaskGroup.hpp
#        svo/thread/ThreadPool.cpp
#        svo/thread/ThreadPool.hpp
#        svo/thread/ThreadUtils.cpp
#        svo/thread/ThreadUtils.hpp

        math/PerlinNoise.cpp
        math/PerlinNoise.hpp

        shader/Shader.cpp
        shader/Shader.hpp

        octree/Octree.cpp
        octree/Octree.hpp

        third-party/lz4.c
        third-party/lz4.h

        third-party/FastNoiseSIMD/FastNoiseSIMD/FastNoiseSIMD.cpp
        third-party/FastNoiseSIMD/FastNoiseSIMD/FastNoiseSIMD.h
        third-party/FastNoiseSIMD/FastNoiseSIMD/FastNoiseSIMD_internal.cpp
        third-party/FastNoiseSIMD/FastNoiseSIMD/FastNoiseSIMD_internal.h
        third-party/FastNoiseSIMD/FastNoiseSIMD/FastNoiseSIMD_avx2.cpp
        third-party/FastNoiseSIMD/FastNoiseSIMD/FastNoiseSIMD_sse2.cpp
        third-party/FastNoiseSIMD/FastNoiseSIMD/FastNoiseSIMD_sse41.cpp

        entity/Terrain.cpp
        entity/Terrain.hpp
        svo/IVoxelData.hpp
        svo/VoxelDataNoise.cpp
        svo/VoxelDataNoise.hpp
        #entity/Terrain2BySara.cpp
        #entity/Terrain2BySara.hpp
        )

add_executable(prueba ${SOURCE_FILES})

find_package(PkgConfig REQUIRED)
find_package(OpenGL)
pkg_search_module(GLFW REQUIRED glfw3)
find_package(GLEW REQUIRED)

include_directories(${OPENGL_INCLUDE_DIRS})
include_directories(${GLFW_INCLUDE_DIRS})
include_directories($(GLEW_INCLUDE_DIRS))
target_link_libraries(prueba ${OPENGL_LIBRARY})
target_link_libraries(prueba ${GLFW_LIBRARIES})
target_link_libraries(prueba ${GLEW_LIBRARIES})

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++11 -march=native")

