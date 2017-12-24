//
// Created by manuel on 11/17/16.
//

#include <glm/detail/type_mat.hpp>
#include <glm/detail/type_mat4x4.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include "Cube.hpp"

Cube::Cube() :
        shader(Shader("shader/SimpleVertexShader.glsl", "shader/SimpleFragmentShader.glsl")),
        modelMatrix(glm::mat4()) {

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

Cube::~Cube() {

    // Cleanup VBO & VAO
    glDeleteBuffers(1, &idBufferVertices);
    glDeleteBuffers(1, &idBufferIndices);
    glDeleteVertexArrays(1, &idVao);
}

void Cube::render(glm::mat4 projectionViewMatrix) {

    glm::mat4 projectionViewModel = projectionViewMatrix * modelMatrix;

    // Set GPU program to use
    shader.use();
    GLint mvpLocation = glGetUniformLocation(shader.program, "projectionViewModel");
    glUniformMatrix4fv(mvpLocation, 1, GL_FALSE, &projectionViewModel[0][0]);

    glBindVertexArray(idVao);
    glDrawElements(GL_TRIANGLES, 36, GL_UNSIGNED_INT, 0);
    glBindVertexArray(0);

    glUseProgram(0);
}

// interleaved vertex array for glDrawElements() & glDrawRangeElements() ======
// All vertex attributes (position, normal, color) are packed together as a
// struct or set, for example, ((V,N,C), (V,N,C), (V,N,C),...).
// It is called an array of struct, and provides better memory locality.
const GLfloat Cube::vertices[] = {
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

const int Cube::verticesSize = sizeof(vertices);

const GLuint Cube::indices[] = {
        0, 1, 2, 2, 3, 0,     // front
        4, 5, 6, 6, 7, 4,     // right
        8, 9, 10, 10, 11, 8,     // top
        12, 13, 14, 14, 15, 12,    // left
        16, 17, 18, 18, 19, 16,    // bottom
        20, 21, 22, 22, 23, 20     // back
};

const int Cube::indicesSize = sizeof(indices);

void Cube::update(float dt) {

}
