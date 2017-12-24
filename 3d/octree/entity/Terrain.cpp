//
// Created by manuel on 12/16/16.
//

#include <map>
#include "Terrain.hpp"
#include "../svo/VoxelDataNoise.hpp"

Terrain::Terrain(int depth) :
        depth(depth),
        shader("shader/SimpleVertexShader.glsl", "shader/SimpleFragmentShader.glsl") {

    noiseData = std::unique_ptr<IVoxelData>(new VoxelDataNoise(std::pow(2, depth)));
    _octree = std::unique_ptr<VoxelOctree>(new VoxelOctree(noiseData.get()));

    // Generate vertex array object
    glGenVertexArrays(1, &idVao);
    glBindVertexArray(idVao);
    {
        glGenBuffers(1, &idBufferVertices);
        glBindBuffer(GL_ARRAY_BUFFER, idBufferVertices);
        {
            glBufferData(GL_ARRAY_BUFFER, verticesSize, vertices, GL_STATIC_DRAW);
            glEnableVertexAttribArray(0);
            glEnableVertexAttribArray(1);
            glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * 3 * sizeof(GLfloat), (GLvoid *) 0);
            glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 3 * 3 * sizeof(GLfloat), (GLvoid *) (6 * sizeof(GLfloat)));
        }

        glGenBuffers(1, &idBufferIndices);
        glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, idBufferIndices);
        {
            glBufferData(GL_ELEMENT_ARRAY_BUFFER, indicesSize, indices, GL_STATIC_DRAW);
        }
    }
    glBindVertexArray(0);

}

Terrain::~Terrain() {
    // Cleanup VBO & VAO
    glDeleteBuffers(1, &idBufferVertices);
    glDeleteBuffers(1, &idBufferIndices);
    glDeleteVertexArrays(1, &idVao);
}

void Terrain::render(glm::mat4 projectionViewMatrix, int renderLevel) {

    _renderOctree(0, 0, 0, 0, projectionViewMatrix, 0, renderLevel);
}

static const uint32 BitCount[] = {
        0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4,
        1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5,
        1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5,
        2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6,
        1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5,
        2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6,
        2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6,
        3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7,
        1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5,
        2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6,
        2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6,
        3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7,
        2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6,
        3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7,
        3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7,
        4, 5, 5, 6, 5, 6, 6, 7, 5, 6, 6, 7, 6, 7, 7, 8
};

void Terrain::_renderOctree(uint64 nodeIndex, uint32 nodex, uint32 nodey, uint32 nodez, glm::mat4 &projectionViewMatrix,
                            int current_depth, int renderLevel) {

    // Scale of the octants in blocks, for depth 8 and current_depth = 0 -> 2^(8 - 1 - 0) = 128
    int octant_scale = 1 << (depth - 1 - current_depth);
    // Scale at the current rendering level in blocks 2^(8 - 0) = 256
    int current_scale = 1 << (depth - current_depth);

    uint32 &descriptor = _octree->_octree[nodeIndex];

    // This bit operations unpack the node descriptor from this 32-bit compressed format:
    // OOOO OOOO OOOO OOXY CCCC CCCC LLLL LLLL
    // L = leaf mask, information about leaf nodes
    // C = child mask, information about child nodes
    // Y = hasLargeChildren flag
    // X = isLargeNode flag
    // O = child offset, data where child information resides
    bool hasLargeChildren = (bool) (descriptor & 0x20000);
    bool isLargeNode = (bool) (descriptor & 0x10000);
    uint8 leafMask = (uint8) (descriptor & 0xFF);
    uint8 childMask = (uint8) ((descriptor & 0xFF00) >> 8);
//    int childCount = BitCount[childMask & 255]; //unused
    uint64 childsOffset = descriptor >> 18;
    if (hasLargeChildren)
        childsOffset = (childsOffset << 32) | uint64(_octree->_octree[nodeIndex + 1]);

    glm::mat4 instanceModelMatrix = glm::mat4();
    instanceModelMatrix = glm::translate(instanceModelMatrix,
                                         glm::vec3(nodex, nodey, nodez));
    instanceModelMatrix = glm::scale(instanceModelMatrix, glm::vec3(current_scale, current_scale, current_scale));
    instanceModelMatrix = glm::translate(instanceModelMatrix,
                                         glm::vec3(0.5f, 0.5f, 0.5f));

    glm::mat4 projectionViewModel = projectionViewMatrix * instanceModelMatrix;

    if(current_depth == renderLevel) {
        // Set GPU program to use
        shader.use();
        GLint mvpLocation = glGetUniformLocation(shader.program, "projectionViewModel");
        glUniformMatrix4fv(mvpLocation, 1, GL_FALSE, &projectionViewModel[0][0]);

        glBindVertexArray(idVao);
        glPolygonMode(GL_FRONT_AND_BACK, GL_LINE);
        glDrawElements(GL_TRIANGLES, 36, GL_UNSIGNED_INT, 0);
        glBindVertexArray(0);

        glUseProgram(0);
    }

    if(leafMask != 0) {

        // To extract the position we rely in the encoding used by the octree building method (below)
        // for each octant we look if a child exists by looking at the childMask, if it exists, then
        // we obtain the position by indexing in the arrays below
        int posX[] = {1, 0, 1, 0, 1, 0, 1, 0};
        int posY[] = {1, 1, 0, 0, 1, 1, 0, 0};
        int posZ[] = {1, 1, 1, 1, 0, 0, 0, 0};

        int nextDepth = current_depth + 1;

        int iChild = 0;
        for (int iOctant = 0; iOctant < 8; ++iOctant) {
            if ((childMask >> iOctant) & 1) {
                _renderOctree(
                        nodeIndex + childsOffset + (isLargeNode ? iChild*2 : iChild), // We have to skip far pointers
                        nodex + posX[iChild] * octant_scale,
                        nodey + posY[iChild] * octant_scale,
                        nodez + posZ[iChild] * octant_scale,
                        projectionViewMatrix,
                        nextDepth, renderLevel);
                iChild++;
            }
        }

    }
}

void Terrain::update(float dt) {

}

const GLfloat Terrain::vertices[] = {
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

const int Terrain::verticesSize = sizeof(vertices);

const GLuint Terrain::indices[] = {
        0, 1, 2, 2, 3, 0,     // front
        4, 5, 6, 6, 7, 4,     // right
        8, 9, 10, 10, 11, 8,     // top
        12, 13, 14, 14, 15, 12,    // left
        16, 17, 18, 18, 19, 16,    // bottom
        20, 21, 22, 22, 23, 20     // back
};

const int Terrain::indicesSize = sizeof(indices);