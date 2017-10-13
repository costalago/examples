//
// Created by Manuel & Sara on 12/7/16.
//

#include "Octree.hpp"

Octree::Octree(Octree &f) : data(f.data){

    for (int i = 0; i <8; ++i) {
        childs[i] = std::move(f.childs[i]);
    }

}
