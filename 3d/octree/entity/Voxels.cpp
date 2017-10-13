//
// Created by manuel on 12/10/16.
//

#include <cmath>
#include <glm/gtc/matrix_transform.hpp>
#include "Voxels.hpp"

Voxels::Voxels(int width) :
        width(width),
        levels((int) std::log2(width) + 1),
        shader("shader/SimpleVertexShader.glsl", "shader/SimpleFragmentShader.glsl"),
        voxelOctree(Octree::buildVoxelOctree(width)) {

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

Voxels::~Voxels() {
    // Cleanup VBO & VAO
    glDeleteBuffers(1, &idBufferVertices);
    glDeleteBuffers(1, &idBufferIndices);
    glDeleteVertexArrays(1, &idVao);
}

void Voxels::render(glm::mat4 projectionViewMatrix) {

    int draw_level = 7;

    _renderNode(*voxelOctree, projectionViewMatrix, 0, 0, 0, 0, draw_level);

}

void Voxels::_renderNode(Octree &octree, glm::mat4 projectionViewMatrix,
                         int level, int nodex, int nodey, int nodez, int draw_level) {

    if (level > draw_level) {
        return;
    }

    if (level == draw_level) {
        float scale = std::pow(2, levels - 1 - level);

        // We have to move to the position of this node and the size of the current level
        glm::mat4 instanceModelMatrix = glm::mat4();
        instanceModelMatrix = glm::translate(instanceModelMatrix,
                                             glm::vec3(nodex + scale / 2, nodey + scale / 2, nodez + scale / 2));
        instanceModelMatrix = glm::scale(instanceModelMatrix, glm::vec3(scale, scale, scale));

        glm::mat4 projectionViewModel = projectionViewMatrix * instanceModelMatrix;

        // Set GPU program to use
        shader.use();
        GLint mvpLocation = glGetUniformLocation(shader.program, "projectionViewModel");
        glUniformMatrix4fv(mvpLocation, 1, GL_FALSE, &projectionViewModel[0][0]);

        glBindVertexArray(idVao);
        glPolygonMode(GL_FRONT_AND_BACK, GL_FILL);
//        glPolygonMode(GL_FRONT_AND_BACK, GL_LINE);
        glDrawElements(GL_LINE_STRIP, 22, GL_UNSIGNED_INT, 0);
//        glPolygonMode(GL_FRONT_AND_BACK, GL_FILL);
        glBindVertexArray(0);

        glUseProgram(0);
    }

    int octant_voxels_width = (int) (std::pow(2, std::log2(width) - level) / 2);

    // Render children
    for (int i_octant = 0; i_octant < 8; ++i_octant) {
        int octantx = (i_octant % 2) * octant_voxels_width + nodex;
        int octanty = (i_octant > 3) * octant_voxels_width + nodey;
        int octantz =
                (i_octant == 2 || i_octant == 3 || i_octant == 6 || i_octant == 7) * octant_voxels_width + nodez;

        if (octree.childs[i_octant] != nullptr) {
            _renderNode(*octree.childs[i_octant], projectionViewMatrix, level + 1, octantx, octanty, octantz,
                        draw_level);
        }
    }

}

const GLfloat Voxels::vertices[] = {
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

const int Voxels::verticesSize = sizeof(vertices);

const GLuint Voxels::indices[] = {
        0, 1, 2, 3, 4,     // front
        5, 6, 7, 8, 9,   // right
        8, 9, 10, 11, 12,     // top
        12, 13, 14, 15, 16,    // left
        16, 17, 18, 19, 20,   // bottom
        20, 21, 22, 23,    // back
};

const int Voxels::indicesSize = sizeof(indices);

void Voxels::update(float dt) {

}

// We can't copy construct a unique_ptr so the default generated copy constructor can't be built
// we have to define it explicitly here and it moves the pointer instead of copyting it.
// http://stackoverflow.com/questions/15032501/stdunique-ptr-deleted-function-initializer-list-driven-allocation
Voxels::Voxels(Voxels &&f) :
        width(f.width),
        levels(f.levels),
        shader(f.shader),
        voxelOctree(std::move(f.voxelOctree)) {}