//
// Created by manuel on 11/22/16.
//

#include <climits>
#include <glm/gtc/matrix_transform.hpp>
#include "../math/PerlinNoise.hpp"
#include "Chunk.hpp"
#include "../third-party/FastNoiseSIMD/FastNoiseSIMD/FastNoiseSIMD.h"

Chunk::Chunk(int resolution, int width, int chunkx, int chunky, int chunkz) :
        instanceModelMatrix(glm::mat4()),
        modelMatrix(glm::mat4()),
        shader(Shader("shader/InstancedInterleavedVertexShader.glsl", "shader/SimpleFragmentShader.glsl")),
        positions() {

    // Scale every block to the appropiate resolution for this chunk
    instanceModelMatrix = glm::scale(instanceModelMatrix,
                                     glm::vec3(std::pow(2, resolution), std::pow(2, resolution),
                                               std::pow(2, resolution)));

    int blocks = blocksForResolutionAndWidth(resolution, width);

    FastNoiseSIMD *noiseSIMD = FastNoiseSIMD::NewFastNoiseSIMD();
    std::cout << "FastNoiseSIMD initialized" << std::endl;
    std::cout << "SIMD Level: " << noiseSIMD->GetSIMDLevel() << std::endl;
//    float *noisez = noiseSIMD->GetSimplexFractalSet(chunkx*width, chunky*width, chunkz*width, blocks, blocks, blocks, 1);
    noiseSIMD->SetFractalOctaves(chunkx);
    float *noisez = noiseSIMD->GetSimplexFractalSet(0, 0, 0, blocks, blocks, blocks);
//    float *noisez = noiseSIMD->GetCellularSet(0, 0, 0, blocks, blocks, blocks, 2);

    double noise_min = INT_MAX;
    double noise_max = INT_MIN;
    double noise_average = 0;


    // 2D Voxels
    for (int by = 0; by < blocks; by++) {
        for (int bz = 0; bz < blocks; bz++) {
            for (int bx = 0; bx < blocks; bx++) {
                // Sample the same slice of the 3d noise over and over
                float noise = noisez[bx + bz * width];

                noise += 1; // (-1, 1) => (0, 2)
                noise /= 2; // (0, 2) => (0, 1)
                noise *= width;

                if(by < noise && by > noise - 2) {
                    positions.push_back(glm::vec3(bx, by, bz));
                }
            }
        }
    }

    noiseSIMD->FreeNoiseSet(noisez);

    noise_average /= blocks * blocks * blocks;

    std::cout << "Drawing chunk at (: " << chunkx << ", " << chunky << ", " << chunkz << ")" << std::endl;
    std::cout << "Width at maximum resolution: " << width << std::endl;
    std::cout << "Actual resolution: " << resolution << std::endl;
    std::cout << "Block width: " << blocks << std::endl;
    std::cout << "Block size:" << std::pow(2, resolution) << std::endl;
    std::cout << "Medium noise: " << noise_average << std::endl;
    std::cout << "Lowest noise: " << noise_min << std::endl;
    std::cout << "Highest noise: " << noise_max << std::endl;
    std::cout << "Number of blocks drawn: " << positions.size() << " blocks." << std::endl << std::endl;

    glGenVertexArrays(1, &idVao);
    glBindVertexArray(idVao);
    {
        glGenBuffers(1, &idBufferVertices);
        glBindBuffer(GL_ARRAY_BUFFER, idBufferVertices);
        {
            glBufferData(GL_ARRAY_BUFFER, verticesSize, vertices, GL_STATIC_DRAW);
            glEnableVertexAttribArray(0);
            glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * 3 * sizeof(GLfloat), (GLvoid *) 0);
            glEnableVertexAttribArray(1);
            glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 3 * 3 * sizeof(GLfloat),
                                  (GLvoid *) (6 * sizeof(GLfloat)));
        }

        glGenBuffers(1, &idBufferPositions);
        glBindBuffer(GL_ARRAY_BUFFER, idBufferPositions);
        {
            glBufferData(GL_ARRAY_BUFFER, sizeof(glm::vec3) * positions.size(),
                         &positions[0], GL_STATIC_DRAW);
            glEnableVertexAttribArray(2);
            glVertexAttribPointer(2, 3, GL_FLOAT, GL_FALSE, 0, (GLvoid *) 0);
            glVertexAttribDivisor(2, 1);
        }

        glGenBuffers(1, &idBufferIndices);
        glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, idBufferIndices);
        {
            glBufferData(GL_ELEMENT_ARRAY_BUFFER, indicesSize, indices, GL_STATIC_DRAW);
        }
    }
    glBindVertexArray(0);

}

Chunk::~Chunk() {
    glDeleteBuffers(1, &idBufferVertices);
    glDeleteBuffers(1, &idBufferIndices);
    glDeleteBuffers(1, &idBufferPositions);
    glDeleteVertexArrays(1, &idVao);
}

void Chunk::render(glm::mat4 projectionViewMatrix) {

    // This shader will process every vertex sent down the pipeline by the subsequent drawing operations
    shader.use();
    glUniformMatrix4fv(
            glGetUniformLocation(shader.program, "projectionView"), 1, GL_FALSE, &projectionViewMatrix[0][0]);
    glUniformMatrix4fv(
            glGetUniformLocation(shader.program, "model"), 1, GL_FALSE, &modelMatrix[0][0]);
    glUniformMatrix4fv(
            glGetUniformLocation(shader.program, "instanceModel"), 1, GL_FALSE, &instanceModelMatrix[0][0]);

    // Bind vertex array object, associated to it are the generalized vertices buffer, the indices buffer
    // and the per-instance displacements buffer. It also has vertex attribute pointers into the buffers.
    glBindVertexArray(idVao);
    glDrawElementsInstanced(GL_TRIANGLES, 36, GL_UNSIGNED_INT, 0, (GLsizei) positions.size());
    glBindVertexArray(0);

    glUseProgram(0);
}

void Chunk::update(float dt) {
}

float Chunk::noiseOffset(const int resolution, const int block) {
    if (block == 0) {
        if (resolution == 0) {
            return 0;
        } else {
            return 2 * resolution;
        }
    } else {
        return std::pow(2, resolution) * block;
    }
}

int Chunk::resolutionsForWidth(const int width) {
    return std::log2(width) + 1;
}

int Chunk::blocksForResolutionAndWidth(const int resolution, const int width) {
    return std::pow(2, std::log2(width) - resolution);
}

// interleaved vertex array for glDrawElements() & glDrawRangeElements() ======
// All vertex attributes (position, normal, color) are packed together as a
// struct or set, for example, ((V,N,C), (V,N,C), (V,N,C),...).
// It is called an array of struct, and provides better memory locality.
const GLfloat Chunk::vertices[] = {
        0.5f, 0.5f, 0.5f, 0, 0, 1, 1, 1, 1,              // v0 (front)
        -0.5f, 0.5f, 0.5f, 0, 0, 1, 1, 1, 0,              // v1
        -0.5f, -0.5f, 0.5f, 0, 0, 1, 1, 0, 0,              // v2
        0.5f, -0.5f, 0.5f, 0, 0, 1, 1, 0, 1,              // v3

        0.5f, 0.5f, 0.5f, 1, 0, 0, 1, 1, 1,              // v0 (right)
        0.5f, -0.5f, 0.5f, 1, 0, 0, 1, 0, 1,              // v3
        0.5f, -0.5f, -0.5f, 1, 0, 0, 0, 0, 1,              // v4
        0.5f, 0.5f, -0.5f, 1, 0, 0, 0, 1, 1,              // v5

        0.5f, 0.5f, 0.5f, 0, 1, 0, 1, 1, 1,              // v0 (top)
        0.5f, 0.5f, -0.5f, 0, 1, 0, 0, 1, 1,              // v5
        -0.5f, 0.5f, -0.5f, 0, 1, 0, 0, 1, 0,              // v6
        -0.5f, 0.5f, 0.5f, 0, 1, 0, 1, 1, 0,              // v1

        -0.5f, 0.5f, 0.5f, -1, 0, 0, 1, 1, 0,              // v1 (left)
        -0.5f, 0.5f, -0.5f, -1, 0, 0, 0, 1, 0,              // v6
        -0.5f, -0.5f, -0.5f, -1, 0, 0, 0, 0, 0,              // v7
        -0.5f, -0.5f, 0.5f, -1, 0, 0, 1, 0, 0,              // v2

        -0.5f, -0.5f, -0.5f, 0, -1, 0, 0, 0, 0,              // v7 (bottom)
        0.5f, -0.5f, -0.5f, 0, -1, 0, 0, 0, 1,              // v4
        0.5f, -0.5f, 0.5f, 0, -1, 0, 1, 0, 1,              // v3
        -0.5f, -0.5f, 0.5f, 0, -1, 0, 1, 0, 0,              // v2

        0.5f, -0.5f, -0.5f, 0, 0, -1, 0, 0, 1,              // v4 (back)
        -0.5f, -0.5f, -0.5f, 0, 0, -1, 0, 0, 0,              // v7
        -0.5f, 0.5f, -0.5f, 0, 0, -1, 0, 1, 0,              // v6
        0.5f, 0.5f, -0.5f, 0, 0, -1, 0, 1, 1               // v5
};

const int Chunk::verticesSize = sizeof(Chunk::vertices);

const GLuint Chunk::indices[] = {
        0, 1, 2, 2, 3, 0,     // front
        4, 5, 6, 6, 7, 4,     // right
        8, 9, 10, 10, 11, 8,     // top
        12, 13, 14, 14, 15, 12,    // left
        16, 17, 18, 18, 19, 16,    // bottom
        20, 21, 22, 22, 23, 20     // back
};

const int Chunk::indicesSize = sizeof(Chunk::indices);
