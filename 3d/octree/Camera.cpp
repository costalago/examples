//
// Created by manuel on 11/10/16.
//

#include <glm/gtc/matrix_transform.hpp>
#include "Camera.hpp"

Camera::Camera() {
    speed = 500.0f;
    rotateSpeed = 0.1f;

    yAngle = 3.14f;
    xAngle = 0.0f;

    position = glm::vec3(0, 0, 5);
    direction = glm::vec3(0, 0, -1);
    up = glm::vec3(0, 1, 0);
    right = glm::vec3(1, 0, 0);

    // Used to render
    projectionMatrix = glm::perspective(glm::radians(45.0f), (float) 4.0f / (float) 3.0f, 0.1f, 10000.0f);
    viewMatrix = glm::lookAt(
            position, // Camera is at (4,3,3), in World Space
            direction, // and looks at the origin
            up  // Head is up (set to 0,-1,0 to look upside-down)
    );
}

Camera::~Camera() {

}

void Camera::update(float dt) {

    // Direction vector
    direction = glm::vec3(
            cos(xAngle) * sin(yAngle),
            sin(xAngle),
            cos(xAngle) * cos(yAngle)
    );
    // Right vector
    right = glm::vec3(
            sin(yAngle - 3.14f / 2.0f),
            0,
            cos(yAngle - 3.14f / 2.0f)
    );
    // Up vector
    up = glm::cross(right, direction);

    viewMatrix = glm::lookAt(position, position + direction, up);
}

void Camera::strafeRight(float dt) {
    position += right * dt * speed;
}

void Camera::strafeLeft(float dt) {
    position -= right * dt * speed;
}

void Camera::forward(float dt) {
    position += direction * dt * speed;
}

void Camera::backward(float dt) {
    position -= direction * dt * speed;
}

void Camera::pitch(float dt, float amount) {
    xAngle -= rotateSpeed * amount * dt;
}

void Camera::yaw(float dt, float amount) {
    yAngle -= rotateSpeed * amount * dt;
}
