//
// Created by manuel on 11/10/16.
//

#ifndef PRUEBA_CAMERA_HPP
#define PRUEBA_CAMERA_HPP

#include <glm/detail/type_mat4x4.hpp>
#include <glm/vec3.hpp>

class Camera {

public:
    glm::mat4 viewMatrix;
    glm::mat4 projectionMatrix;
    glm::vec3 position;
    glm::vec3 direction;
    glm::vec3 right;
    glm::vec3 up;
    float speed;
    float yAngle;
    float xAngle;
    float rotateSpeed;

    Camera();
    ~Camera();

    void update(float dt);
    void strafeRight(float amount);
    void strafeLeft(float amount);
    void forward(float amount);
    void backward(float amount);
    void pitch(float dt, float amount);
    void yaw(float dt, float amount);
};


#endif //PRUEBA_CAMERA_HPP
