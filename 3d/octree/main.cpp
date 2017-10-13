#include <stdio.h>

#include <GL/glew.h>
#include <GLFW/glfw3.h>

#include <glm/glm.hpp>
#include <iostream>
#include <glm/gtc/matrix_transform.hpp>

#include "entity/Entity.hpp"
#include "Camera.hpp"
#include "entity/Chunk.hpp"
#include "entity/CubeWires.hpp"
#include "octree/Octree.hpp"
#include "entity/Terrain.hpp"
#include "svo/Timer.hpp"
#include "entity/Voxels.hpp"

GLFWwindow *window;

/**
 * Init portable windowing
 * @return
 */
int initWindowing() {

    if (!glfwInit()) {
        fprintf(stderr, "Failed to initialize GLFW\n");
        return -1;
    }

    glfwWindowHint(GLFW_SAMPLES, 4); // 4x antialiasing
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3); // We want OpenGL 3.3
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE); // To make MacOS happy; should not be needed
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE); //We don't want the old OpenGL

    // Open a window and create its OpenGL context
    window = glfwCreateWindow(1024, 768, "OpenGL octrees", NULL, NULL);
    glfwSetWindowPos(window, 200, 200);
    if (window == NULL) {
        fprintf(stderr,
                "Failed to open GLFW window. If you have an Intel GPU, it isn't 3.3 compatible.\n");
        glfwTerminate();
        return -1;
    }
    glfwMakeContextCurrent(window);

    // Ensure we can capture the escape key being pressed below
    glfwSetInputMode(window, GLFW_STICKY_KEYS, GL_TRUE);

    // Grab the mouse
    glfwSetInputMode(window, GLFW_CURSOR, GLFW_CURSOR_DISABLED);
    glfwSetCursorPos(window, 0, 0);

    return 0;
}

/**
 * Initialize GLEW (OpenGL extension manager)
 * @return
 */
int initGlew() {

    glewExperimental = GL_TRUE; // Needed in core profile
    if (glewInit() != GLEW_OK) {
        fprintf(stderr, "Failed to initialize GLEW\n");
        return -1;
    }

    return 0;
}

int main() {

    // 1. Initialization

    // 1.1 init windowing
    if (initWindowing() == -1) {
        return -1;
    }

    // 1.2 init GLEW to manage OpenGL extensions
    if (initGlew() == -1) {
        return -1;
    }

    // 1.3 Init world
    Camera cam = Camera();

//    // Simplex noise tests
//    FastNoiseSIMD *noiseSIMD = FastNoiseSIMD::NewFastNoiseSIMD();
//    std::cout << "FastNoiseSIMD initialized" << std::endl;
//    std::cout << "SIMD Level: " << noiseSIMD->GetSIMDLevel() << std::endl;
//    int width = 256;
//    float *noise = noiseSIMD->GetSimplexFractalSet(0, 0, 0, width, width, width, 1);
//    noiseSIMD->FreeNoiseSet(noise);

//    // Voxel octree from simplex noise tests
//    Timer t;
//    IVoxelData *noiseData = new VoxelDataNoise(64);
//    t.bench("Noise building");
//    t.start();
//    VoxelOctree octree(noiseData);
//    t.bench("Octree building");
//    t.start();
//    octree.save("savedoctree.oct");
//    octree.prettyPrintTree((uint32) std::log2(16));
//    octree.prettyPrintTreeSequential(300);
//    t.bench("Octree saving");
//    std::cout << "saved" << std::endl;

    // Rendering of procedurally generated voxel octree
//    Terrain terrain((int) std::log2(32));


    Voxels vox = Voxels(128);
    Chunk chunk = Chunk(0, 128, 0, 0, 0);
    Chunk chunk1 = Chunk(0, 128, 4, 0, 0);
    chunk1.modelMatrix = glm::translate(chunk1.modelMatrix, glm::vec3(128.0f, 0.0f, 0.0f));
    Chunk chunk2 = Chunk(1, 128, 0, 0, 0);
    chunk2.modelMatrix = glm::translate(chunk2.modelMatrix, glm::vec3(-128.0f, 0.0f, 0.0f));
    Chunk chunk3 = Chunk(3, 128, 0, 0, 0);
    chunk3.modelMatrix = glm::translate(chunk3.modelMatrix, glm::vec3(128.0f*3, 0.0f, 0.0f));
    Chunk chunk4 = Chunk(4, 128, 0, 0, 0);
    chunk4.modelMatrix = glm::translate(chunk4.modelMatrix, glm::vec3(140.0f*4, 0.0f, 0.0f));
    Chunk chunk5 = Chunk(5, 128, 0, 0, 0);
    chunk5.modelMatrix = glm::translate(chunk5.modelMatrix, glm::vec3(140.0f*5, 0.0f, 0.0f));

    // Simple test mesh
    CubeWires cube = CubeWires();

    // 1.4 Init OpenGL rendering
    // OpenGL settings
    glClearColor(0.0f, 0.0f, 0.0f, 0.0f); // The default background color
    glEnable(GL_DEPTH_TEST); // Enable depth buffer
    glDepthFunc(GL_LESS); // Clip occluded stuff
    glEnable(GL_CULL_FACE); // Enable backface culling

    double lastLoopTimestamp = glfwGetTime();

    // Main world loop
    while (!glfwWindowShouldClose(window)) {

        // 1. Calculate time elapsed from last frame
        double currentLoopTimestamp = glfwGetTime();
        float dt = float(currentLoopTimestamp - lastLoopTimestamp);

        // 2. Read user input and change world state accordingly
        if (glfwGetKey(window, GLFW_KEY_ESCAPE) == GLFW_PRESS)
            glfwSetWindowShouldClose(window, GL_TRUE);

        // Get mouse position
        double xpos, ypos;
        glfwGetCursorPos(window, &xpos, &ypos);
        glfwSetCursorPos(window, 0, 0);
        cam.yaw(dt, float(xpos));
        cam.pitch(dt, float(ypos));

        if (glfwGetKey(window, GLFW_KEY_W) == GLFW_PRESS) {
            cam.forward(dt);
        }
        if (glfwGetKey(window, GLFW_KEY_S) == GLFW_PRESS) {
            cam.backward(dt);
        }
        if (glfwGetKey(window, GLFW_KEY_D) == GLFW_PRESS) {
            cam.strafeRight(dt);
        }
        if (glfwGetKey(window, GLFW_KEY_A) == GLFW_PRESS) {
            cam.strafeLeft(dt);
        }

        // 3. Evolve world state
        cam.update(dt);

        // 4. Render world

        // Clear color and depth buffers
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

//        terrain.render(cam.projectionMatrix * cam.viewMatrix, 1);

        chunk.render(cam.projectionMatrix * cam.viewMatrix);
        chunk1.render(cam.projectionMatrix * cam.viewMatrix);
        chunk2.render(cam.projectionMatrix * cam.viewMatrix);
//        chunk3.render(cam.projectionMatrix * cam.viewMatrix);
//        chunk4.render(cam.projectionMatrix * cam.viewMatrix);
//        chunk5.render(cam.projectionMatrix * cam.viewMatrix);

        cube.render(cam.projectionMatrix * cam.viewMatrix);

//        vox.render(cam.projectionMatrix * cam.viewMatrix);


        // Swap buffers
        glfwSwapBuffers(window);
        glfwPollEvents();

        lastLoopTimestamp = currentLoopTimestamp;

    };

    // Close OpenGL window and terminate GLFW
    glfwTerminate();

    return 0;
}