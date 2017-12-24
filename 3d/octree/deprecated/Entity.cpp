//
// Created by manuel on 11/10/16.
//

#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>

#include "Entity.hpp"

Entity::Entity(Mesh &mesh) : mesh(mesh) {
    modelMatrix = glm::scale(glm::mat4(1.0f), glm::vec3(0.5f, 0.5f, 0.5f));
}

Entity::~Entity() {}

void Entity::update(float dt) {
}

void Entity::render(glm::mat4 modelViewMatrix) {
    mesh.render(modelViewMatrix * modelMatrix);
}



