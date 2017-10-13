//
// Created by manuel on 12/7/16.
//

#include "CubeWires.hpp"
#include <glm/gtc/matrix_transform.hpp>

CubeWires::CubeWires() :
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

CubeWires::~CubeWires() {

    // Cleanup VBO & VAO
    glDeleteBuffers(1, &idBufferVertices);
    glDeleteBuffers(1, &idBufferIndices);
    glDeleteVertexArrays(1, &idVao);
}

void CubeWires::render(glm::mat4 projectionViewMatrix) {

    glm::mat4 projectionViewModel = projectionViewMatrix * modelMatrix;

    // Set GPU program to use
    shader.use();
    GLint mvpLocation = glGetUniformLocation(shader.program, "projectionViewModel");
    glUniformMatrix4fv(mvpLocation, 1, GL_FALSE, &projectionViewModel[0][0]);

    glBindVertexArray(idVao);
    glPolygonMode( GL_FRONT_AND_BACK, GL_LINE );
    glDrawElements(GL_LINE_STRIP, 22, GL_UNSIGNED_INT, 0);
    glPolygonMode( GL_FRONT_AND_BACK, GL_FILL );
    glBindVertexArray(0);

    glUseProgram(0);
}

// interleaved vertex array for glDrawElements() & glDrawRangeElements() ======
// All vertex attributes (position, normal, color) are packed together as a
// struct or set, for example, ((V,N,C), (V,N,C), (V,N,C),...).
// It is called an array of struct, and provides better memory locality.

const GLfloat CubeWires::vertices[] = {
        0.5f, 0.5f, 0.5f, 0, 0, 1, 1, 0, 0,              // v0 (front)
        -0.5f, 0.5f, 0.5f, 0, 0, 1, 1, 0, 0,              // v1
        -0.5f, -0.5f, 0.5f, 0, 0, 1, 1, 0, 0,              // v2
        0.5f, -0.5f, 0.5f, 0, 0, 1, 1, 0, 0,              // v3

        0.5f, 0.5f, 0.5f, 1, 0, 0, 1, 0, 0,              // v0 (right)
        0.5f, -0.5f, 0.5f, 1, 0, 0, 1, 0, 0,              // v3
        0.5f, -0.5f, -0.5f, 1, 0, 0, 1, 0, 0,              // v4
        0.5f, 0.5f, -0.5f, 1, 0, 0, 1, 0, 0,              // v5

        0.5f, 0.5f, 0.5f, 0, 1, 0, 1, 0, 0,              // v0 (top)
        0.5f, 0.5f, -0.5f, 0, 1, 0, 1, 0, 0,              // v5
        -0.5f, 0.5f, -0.5f, 0, 1, 0, 1, 0, 0,              // v6
        -0.5f, 0.5f, 0.5f, 0, 1, 0, 1, 0, 0,              // v1

        -0.5f, 0.5f, 0.5f, -1, 0, 0, 1, 0, 0,              // v1 (left)
        -0.5f, 0.5f, -0.5f, -1, 0, 0, 1, 0, 0,              // v6
        -0.5f, -0.5f, -0.5f, -1, 0, 0, 1, 0, 0,              // v7
        -0.5f, -0.5f, 0.5f, -1, 0, 0, 1, 0, 0,              // v2

        -0.5f, -0.5f, -0.5f, 0, -1, 0, 1, 0, 0,              // v7 (bottom)
        0.5f, -0.5f, -0.5f, 0, -1, 0, 1, 0, 0,              // v4
        0.5f, -0.5f, 0.5f, 0, -1, 0, 1, 0, 0,              // v3
        -0.5f, -0.5f, 0.5f, 0, -1, 0, 1, 0, 0,              // v2

        0.5f, -0.5f, -0.5f, 0, 0, -1, 1, 0, 0,              // v4 (back)
        -0.5f, -0.5f, -0.5f, 0, 0, -1, 1, 0, 0,              // v7
        -0.5f, 0.5f, -0.5f, 0, 0, -1, 1, 0, 0,              // v6
        0.5f, 0.5f, -0.5f, 0, 0, -1, 1, 0, 0               // v5
};

const int CubeWires::verticesSize = sizeof(vertices);

const GLuint CubeWires::indices[] = {
        0, 1, 2, 3, 4,     // front
        5, 6, 7, 8, 9,   // right
        8, 9, 10, 11, 12,     // top
        12, 13, 14, 15, 16,    // left
        16, 17, 18, 19, 20,   // bottom
        20, 21, 22, 23,    // back
};

const int CubeWires::indicesSize = sizeof(indices);

void CubeWires::update(float dt) {

}