//
// Created by manuel on 11/10/16.
//

#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>

#include "Entity.hpp"

Entity::Entity(Cube &mesh) : mesh(mesh) {

}

Entity::~Entity() {}

void Entity::update(float dt) {
}

void Entity::render(glm::mat4 modelViewMatrix) {
    mesh.render(modelViewMatrix * modelMatrix);
}



