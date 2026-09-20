// Generated from Blender 5.2.2 LTS (d13f752e3b9c).
// Run npm run generate:blender-map after updating the official schema fixture.
export const BLENDER_VERSION = "5.2.2 LTS";
export const BLENDER_BUILD_HASH = "d13f752e3b9c";
export default {
  "input_texture_coordinate": {
    "blIdname": "ShaderNodeTexCoord",
    "inputs": {},
    "outputs": {
      "generated": {
        "name": "Generated",
        "identifier": "Generated",
        "index": 0,
        "occurrence": 0
      },
      "normal": {
        "name": "Normal",
        "identifier": "Normal",
        "index": 1,
        "occurrence": 0
      },
      "uv": {
        "name": "UV",
        "identifier": "UV",
        "index": 2,
        "occurrence": 0
      },
      "object": {
        "name": "Object",
        "identifier": "Object",
        "index": 3,
        "occurrence": 0
      },
      "camera": {
        "name": "Camera",
        "identifier": "Camera",
        "index": 4,
        "occurrence": 0
      },
      "window": {
        "name": "Window",
        "identifier": "Window",
        "index": 5,
        "occurrence": 0
      },
      "reflection": {
        "name": "Reflection",
        "identifier": "Reflection",
        "index": 6,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "input_uv_map": {
    "blIdname": "ShaderNodeUVMap",
    "inputs": {},
    "outputs": {
      "uv": {
        "name": "UV",
        "identifier": "UV",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "input_rgb": {
    "blIdname": "ShaderNodeRGB",
    "inputs": {},
    "outputs": {
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {
      "color": {
        "special": true
      }
    }
  },
  "input_value": {
    "blIdname": "ShaderNodeValue",
    "inputs": {},
    "outputs": {
      "value": {
        "name": "Value",
        "identifier": "Value",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {
      "value": {
        "special": true
      }
    }
  },
  "input_scene_time": {
    "blIdname": "GeometryNodeInputSceneTime",
    "inputs": {},
    "outputs": {
      "seconds": {
        "name": "Seconds",
        "identifier": "Seconds",
        "index": 0,
        "occurrence": 0
      },
      "frames": {
        "name": "Frame",
        "identifier": "Frame",
        "index": 1,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "input_fresnel": {
    "blIdname": "ShaderNodeFresnel",
    "inputs": {
      "ior": {
        "name": "IOR",
        "identifier": "IOR",
        "index": 0,
        "occurrence": 0
      },
      "normal": {
        "name": "Normal",
        "identifier": "Normal",
        "index": 1,
        "occurrence": 0
      }
    },
    "outputs": {
      "fac": {
        "name": "Factor",
        "identifier": "Fac",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "input_layer_weight": {
    "blIdname": "ShaderNodeLayerWeight",
    "inputs": {
      "blend": {
        "name": "Blend",
        "identifier": "Blend",
        "index": 0,
        "occurrence": 0
      },
      "normal": {
        "name": "Normal",
        "identifier": "Normal",
        "index": 1,
        "occurrence": 0
      }
    },
    "outputs": {
      "fresnel": {
        "name": "Fresnel",
        "identifier": "Fresnel",
        "index": 0,
        "occurrence": 0
      },
      "facing": {
        "name": "Facing",
        "identifier": "Facing",
        "index": 1,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "input_object_info": {
    "blIdname": "ShaderNodeObjectInfo",
    "inputs": {},
    "outputs": {
      "location": {
        "name": "Location",
        "identifier": "Location",
        "index": 0,
        "occurrence": 0
      },
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 1,
        "occurrence": 0
      },
      "random": {
        "name": "Random",
        "identifier": "Random",
        "index": 5,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "input_geometry": {
    "blIdname": "ShaderNodeNewGeometry",
    "inputs": {},
    "outputs": {
      "position": {
        "name": "Position",
        "identifier": "Position",
        "index": 0,
        "occurrence": 0
      },
      "normal": {
        "name": "Normal",
        "identifier": "Normal",
        "index": 1,
        "occurrence": 0
      },
      "tangent": {
        "name": "Tangent",
        "identifier": "Tangent",
        "index": 2,
        "occurrence": 0
      },
      "incoming": {
        "name": "Incoming",
        "identifier": "Incoming",
        "index": 4,
        "occurrence": 0
      },
      "pointiness": {
        "name": "Pointiness",
        "identifier": "Pointiness",
        "index": 7,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "input_camera_data": {
    "blIdname": "ShaderNodeCameraData",
    "inputs": {},
    "outputs": {
      "viewVector": {
        "name": "View Vector",
        "identifier": "View Vector",
        "index": 0,
        "occurrence": 0
      },
      "viewZDepth": {
        "name": "View Z Depth",
        "identifier": "View Z Depth",
        "index": 1,
        "occurrence": 0
      },
      "viewDistance": {
        "name": "View Distance",
        "identifier": "View Distance",
        "index": 2,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "input_light_path": {
    "blIdname": "ShaderNodeLightPath",
    "inputs": {},
    "outputs": {
      "isCameraRay": {
        "name": "Is Camera Ray",
        "identifier": "Is Camera Ray",
        "index": 0,
        "occurrence": 0
      },
      "isShadowRay": {
        "name": "Is Shadow Ray",
        "identifier": "Is Shadow Ray",
        "index": 1,
        "occurrence": 0
      },
      "isReflectionRay": {
        "name": "Is Reflection Ray",
        "identifier": "Is Reflection Ray",
        "index": 5,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "input_ambient_occlusion": {
    "blIdname": "ShaderNodeAmbientOcclusion",
    "inputs": {
      "distance": {
        "name": "Distance",
        "identifier": "Distance",
        "index": 1,
        "occurrence": 0
      },
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 0,
        "occurrence": 0
      }
    },
    "outputs": {
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 0,
        "occurrence": 0
      },
      "ao": {
        "name": "AO",
        "identifier": "AO",
        "index": 1,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "input_bevel": {
    "blIdname": "ShaderNodeBevel",
    "inputs": {
      "radius": {
        "name": "Radius",
        "identifier": "Radius",
        "index": 0,
        "occurrence": 0
      }
    },
    "outputs": {
      "normal": {
        "name": "Normal",
        "identifier": "Normal",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "input_wireframe": {
    "blIdname": "ShaderNodeWireframe",
    "inputs": {
      "size": {
        "name": "Size",
        "identifier": "Size",
        "index": 0,
        "occurrence": 0
      }
    },
    "outputs": {
      "fac": {
        "name": "Factor",
        "identifier": "Fac",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "input_attribute": {
    "blIdname": "ShaderNodeAttribute",
    "inputs": {},
    "outputs": {
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 0,
        "occurrence": 0
      },
      "vector": {
        "name": "Vector",
        "identifier": "Vector",
        "index": 1,
        "occurrence": 0
      },
      "fac": {
        "name": "Factor",
        "identifier": "Fac",
        "index": 2,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "input_point_info": {
    "blIdname": "ShaderNodePointInfo",
    "inputs": {},
    "outputs": {
      "position": {
        "name": "Position",
        "identifier": "Position",
        "index": 0,
        "occurrence": 0
      },
      "radius": {
        "name": "Radius",
        "identifier": "Radius",
        "index": 1,
        "occurrence": 0
      },
      "random": {
        "name": "Random",
        "identifier": "Random",
        "index": 2,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "input_particle_info": {
    "blIdname": "ShaderNodeParticleInfo",
    "inputs": {},
    "outputs": {
      "age": {
        "name": "Age",
        "identifier": "Age",
        "index": 2,
        "occurrence": 0
      },
      "location": {
        "name": "Location",
        "identifier": "Location",
        "index": 4,
        "occurrence": 0
      },
      "size": {
        "name": "Size",
        "identifier": "Size",
        "index": 5,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "input_curves_info": {
    "blIdname": "ShaderNodeHairInfo",
    "inputs": {},
    "outputs": {
      "tangent": null,
      "length": {
        "name": "Length",
        "identifier": "Length",
        "index": 2,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "input_volume_info": {
    "blIdname": "ShaderNodeVolumeInfo",
    "inputs": {},
    "outputs": {
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 0,
        "occurrence": 0
      },
      "density": {
        "name": "Density",
        "identifier": "Density",
        "index": 1,
        "occurrence": 0
      },
      "temperature": {
        "name": "Temperature",
        "identifier": "Temperature",
        "index": 3,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "output_material": {
    "blIdname": "ShaderNodeOutputMaterial",
    "inputs": {
      "surface": {
        "name": "Surface",
        "identifier": "Surface",
        "index": 0,
        "occurrence": 0
      },
      "volume": {
        "name": "Volume",
        "identifier": "Volume",
        "index": 1,
        "occurrence": 0
      },
      "displacement": {
        "name": "Displacement",
        "identifier": "Displacement",
        "index": 2,
        "occurrence": 0
      },
      "thickness": {
        "name": "Thickness",
        "identifier": "Thickness",
        "index": 3,
        "occurrence": 0
      }
    },
    "outputs": {},
    "settings": {}
  },
  "shader_principled_bsdf": {
    "blIdname": "ShaderNodeBsdfPrincipled",
    "inputs": {
      "baseColor": {
        "name": "Base Color",
        "identifier": "Base Color",
        "index": 0,
        "occurrence": 0
      },
      "metallic": {
        "name": "Metallic",
        "identifier": "Metallic",
        "index": 1,
        "occurrence": 0
      },
      "roughness": {
        "name": "Roughness",
        "identifier": "Roughness",
        "index": 2,
        "occurrence": 0
      },
      "ior": {
        "name": "IOR",
        "identifier": "IOR",
        "index": 3,
        "occurrence": 0
      },
      "alpha": {
        "name": "Alpha",
        "identifier": "Alpha",
        "index": 4,
        "occurrence": 0
      },
      "thinWall": {
        "name": "Thin Wall",
        "identifier": "Thin Wall",
        "index": 5,
        "occurrence": 0
      },
      "normal": {
        "name": "Normal",
        "identifier": "Normal",
        "index": 6,
        "occurrence": 0
      },
      "diffuseRoughness": {
        "name": "Roughness",
        "identifier": "Roughness",
        "index": 2,
        "occurrence": 1
      },
      "subsurfaceWeight": {
        "name": "Weight",
        "identifier": "Weight",
        "index": 7,
        "occurrence": 0
      },
      "subsurfaceRadius": null,
      "subsurfaceScale": null,
      "subsurfaceAnisotropy": null,
      "specularIorLevel": null,
      "specularTint": null,
      "anisotropy": {
        "name": "Anisotropic",
        "identifier": "Anisotropic",
        "index": 16,
        "occurrence": 0
      },
      "anisotropyRotation": {
        "name": "Anisotropic Rotation",
        "identifier": "Anisotropic Rotation",
        "index": 17,
        "occurrence": 0
      },
      "tangent": {
        "name": "Tangent",
        "identifier": "Tangent",
        "index": 18,
        "occurrence": 0
      },
      "transmissionWeight": {
        "name": "Weight",
        "identifier": "Weight",
        "index": 7,
        "occurrence": 1
      },
      "coatWeight": {
        "name": "Weight",
        "identifier": "Weight",
        "index": 7,
        "occurrence": 2
      },
      "coatRoughness": {
        "name": "Roughness",
        "identifier": "Roughness",
        "index": 2,
        "occurrence": 2
      },
      "coatIor": {
        "name": "IOR",
        "identifier": "IOR",
        "index": 3,
        "occurrence": 1
      },
      "coatTint": null,
      "coatNormal": {
        "name": "Normal",
        "identifier": "Normal",
        "index": 6,
        "occurrence": 1
      },
      "sheenWeight": {
        "name": "Weight",
        "identifier": "Weight",
        "index": 7,
        "occurrence": 3
      },
      "sheenRoughness": {
        "name": "Roughness",
        "identifier": "Roughness",
        "index": 2,
        "occurrence": 3
      },
      "sheenTint": null,
      "emissionColor": {
        "name": "Emission Color",
        "identifier": "Emission Color",
        "index": 28,
        "occurrence": 0
      },
      "emissionStrength": {
        "name": "Emission Strength",
        "identifier": "Emission Strength",
        "index": 29,
        "occurrence": 0
      },
      "thinFilmThickness": null,
      "thinFilmIor": {
        "name": "IOR",
        "identifier": "IOR",
        "index": 3,
        "occurrence": 2
      }
    },
    "outputs": {
      "bsdf": {
        "name": "BSDF",
        "identifier": "BSDF",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {
      "distribution": {
        "property": "distribution",
        "values": {
          "ggx": "GGX",
          "multi_ggx": "MULTI_GGX"
        }
      },
      "subsurfaceMethod": {
        "property": "subsurface_method",
        "values": {
          "burley": "BURLEY",
          "random_walk": "RANDOM_WALK",
          "random_walk_skin": "RANDOM_WALK_SKIN",
          "random_walk_legacy": "RANDOM_WALK_LEGACY"
        }
      }
    }
  },
  "shader_diffuse_bsdf": {
    "blIdname": "ShaderNodeBsdfDiffuse",
    "inputs": {
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 0,
        "occurrence": 0
      },
      "roughness": {
        "name": "Roughness",
        "identifier": "Roughness",
        "index": 1,
        "occurrence": 0
      },
      "normal": {
        "name": "Normal",
        "identifier": "Normal",
        "index": 2,
        "occurrence": 0
      }
    },
    "outputs": {
      "bsdf": {
        "name": "BSDF",
        "identifier": "BSDF",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "shader_glossy_bsdf": {
    "blIdname": "ShaderNodeBsdfAnisotropic",
    "inputs": {
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 0,
        "occurrence": 0
      },
      "roughness": {
        "name": "Roughness",
        "identifier": "Roughness",
        "index": 1,
        "occurrence": 0
      },
      "anisotropy": {
        "name": "Anisotropy",
        "identifier": "Anisotropy",
        "index": 2,
        "occurrence": 0
      },
      "rotation": {
        "name": "Rotation",
        "identifier": "Rotation",
        "index": 3,
        "occurrence": 0
      },
      "normal": {
        "name": "Normal",
        "identifier": "Normal",
        "index": 4,
        "occurrence": 0
      },
      "tangent": {
        "name": "Tangent",
        "identifier": "Tangent",
        "index": 5,
        "occurrence": 0
      }
    },
    "outputs": {
      "bsdf": {
        "name": "BSDF",
        "identifier": "BSDF",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {
      "distribution": {
        "property": "distribution",
        "values": {
          "beckmann": "BECKMANN",
          "ggx": "GGX",
          "ashikhmin_shirley": "ASHIKHMIN_SHIRLEY",
          "multi_ggx": "MULTI_GGX"
        }
      }
    }
  },
  "shader_emission": {
    "blIdname": "ShaderNodeEmission",
    "inputs": {
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 0,
        "occurrence": 0
      },
      "strength": {
        "name": "Strength",
        "identifier": "Strength",
        "index": 1,
        "occurrence": 0
      }
    },
    "outputs": {
      "bsdf": {
        "name": "Emission",
        "identifier": "Emission",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "shader_transparent_bsdf": {
    "blIdname": "ShaderNodeBsdfTransparent",
    "inputs": {
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 0,
        "occurrence": 0
      }
    },
    "outputs": {
      "bsdf": {
        "name": "BSDF",
        "identifier": "BSDF",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "shader_mix_shader": {
    "blIdname": "ShaderNodeMixShader",
    "inputs": {
      "fac": {
        "name": "Factor",
        "identifier": "Fac",
        "index": 0,
        "occurrence": 0
      },
      "shader1": {
        "name": "Shader",
        "identifier": "Shader",
        "index": 1,
        "occurrence": 0
      },
      "shader2": {
        "name": "Shader",
        "identifier": "Shader_001",
        "index": 2,
        "occurrence": 1
      }
    },
    "outputs": {
      "bsdf": {
        "name": "Shader",
        "identifier": "Shader",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "shader_add_shader": {
    "blIdname": "ShaderNodeAddShader",
    "inputs": {
      "shader1": {
        "name": "Shader",
        "identifier": "Shader",
        "index": 0,
        "occurrence": 0
      },
      "shader2": {
        "name": "Shader",
        "identifier": "Shader_001",
        "index": 1,
        "occurrence": 1
      }
    },
    "outputs": {
      "bsdf": {
        "name": "Shader",
        "identifier": "Shader",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "shader_glass_bsdf": {
    "blIdname": "ShaderNodeBsdfGlass",
    "inputs": {
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 0,
        "occurrence": 0
      },
      "roughness": {
        "name": "Roughness",
        "identifier": "Roughness",
        "index": 1,
        "occurrence": 0
      },
      "ior": {
        "name": "IOR",
        "identifier": "IOR",
        "index": 2,
        "occurrence": 0
      },
      "normal": {
        "name": "Normal",
        "identifier": "Normal",
        "index": 3,
        "occurrence": 0
      },
      "thinFilmThickness": {
        "name": "Thin Film Thickness",
        "identifier": "Thin Film Thickness",
        "index": 5,
        "occurrence": 0
      },
      "thinFilmIor": {
        "name": "Thin Film IOR",
        "identifier": "Thin Film IOR",
        "index": 6,
        "occurrence": 0
      }
    },
    "outputs": {
      "bsdf": {
        "name": "BSDF",
        "identifier": "BSDF",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {
      "distribution": {
        "property": "distribution",
        "values": {
          "beckmann": "BECKMANN",
          "ggx": "GGX",
          "multi_ggx": "MULTI_GGX"
        }
      }
    }
  },
  "shader_toon_bsdf": {
    "blIdname": "ShaderNodeBsdfToon",
    "inputs": {
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 0,
        "occurrence": 0
      },
      "size": {
        "name": "Size",
        "identifier": "Size",
        "index": 1,
        "occurrence": 0
      },
      "smooth": {
        "name": "Smooth",
        "identifier": "Smooth",
        "index": 2,
        "occurrence": 0
      }
    },
    "outputs": {
      "bsdf": {
        "name": "BSDF",
        "identifier": "BSDF",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "shader_translucent_bsdf": {
    "blIdname": "ShaderNodeBsdfTranslucent",
    "inputs": {
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 0,
        "occurrence": 0
      },
      "normal": {
        "name": "Normal",
        "identifier": "Normal",
        "index": 1,
        "occurrence": 0
      }
    },
    "outputs": {
      "bsdf": {
        "name": "BSDF",
        "identifier": "BSDF",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "shader_subsurface_scattering": {
    "blIdname": "ShaderNodeSubsurfaceScattering",
    "inputs": {
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 0,
        "occurrence": 0
      },
      "scale": {
        "name": "Scale",
        "identifier": "Scale",
        "index": 1,
        "occurrence": 0
      },
      "radius": {
        "name": "Radius",
        "identifier": "Radius",
        "index": 2,
        "occurrence": 0
      },
      "ior": {
        "name": "IOR",
        "identifier": "IOR",
        "index": 3,
        "occurrence": 0
      },
      "roughness": {
        "name": "Roughness",
        "identifier": "Roughness",
        "index": 4,
        "occurrence": 0
      },
      "anisotropy": {
        "name": "Anisotropy",
        "identifier": "Anisotropy",
        "index": 5,
        "occurrence": 0
      },
      "normal": {
        "name": "Normal",
        "identifier": "Normal",
        "index": 6,
        "occurrence": 0
      }
    },
    "outputs": {
      "bsdf": {
        "name": "BSSRDF",
        "identifier": "BSSRDF",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {
      "method": {
        "property": "falloff",
        "values": {
          "burley": "BURLEY",
          "random_walk": "RANDOM_WALK",
          "random_walk_skin": "RANDOM_WALK_SKIN",
          "random_walk_legacy": "RANDOM_WALK_LEGACY"
        }
      }
    }
  },
  "shader_sheen_bsdf": {
    "blIdname": "ShaderNodeBsdfSheen",
    "inputs": {
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 0,
        "occurrence": 0
      },
      "roughness": {
        "name": "Roughness",
        "identifier": "Roughness",
        "index": 1,
        "occurrence": 0
      },
      "normal": {
        "name": "Normal",
        "identifier": "Normal",
        "index": 2,
        "occurrence": 0
      }
    },
    "outputs": {
      "bsdf": {
        "name": "BSDF",
        "identifier": "BSDF",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {
      "distribution": {
        "property": "distribution",
        "values": {
          "ashikhmin": "ASHIKHMIN",
          "microfiber": "MICROFIBER"
        }
      }
    }
  },
  "shader_holdout": {
    "blIdname": "ShaderNodeHoldout",
    "inputs": {},
    "outputs": {
      "bsdf": {
        "name": "Holdout",
        "identifier": "Holdout",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "shader_refraction_bsdf": {
    "blIdname": "ShaderNodeBsdfRefraction",
    "inputs": {
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 0,
        "occurrence": 0
      },
      "roughness": {
        "name": "Roughness",
        "identifier": "Roughness",
        "index": 1,
        "occurrence": 0
      },
      "ior": {
        "name": "IOR",
        "identifier": "IOR",
        "index": 2,
        "occurrence": 0
      },
      "normal": {
        "name": "Normal",
        "identifier": "Normal",
        "index": 3,
        "occurrence": 0
      }
    },
    "outputs": {
      "bsdf": {
        "name": "BSDF",
        "identifier": "BSDF",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {
      "distribution": {
        "property": "distribution",
        "values": {
          "beckmann": "BECKMANN",
          "ggx": "GGX"
        }
      }
    }
  },
  "shader_volume_absorption": {
    "blIdname": "ShaderNodeVolumeAbsorption",
    "inputs": {
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 0,
        "occurrence": 0
      },
      "density": {
        "name": "Density",
        "identifier": "Density",
        "index": 1,
        "occurrence": 0
      }
    },
    "outputs": {
      "volume": {
        "name": "Volume",
        "identifier": "Volume",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "shader_volume_scatter": {
    "blIdname": "ShaderNodeVolumeScatter",
    "inputs": {
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 0,
        "occurrence": 0
      },
      "density": {
        "name": "Density",
        "identifier": "Density",
        "index": 1,
        "occurrence": 0
      },
      "anisotropy": {
        "name": "Anisotropy",
        "identifier": "Anisotropy",
        "index": 2,
        "occurrence": 0
      }
    },
    "outputs": {
      "volume": {
        "name": "Volume",
        "identifier": "Volume",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "shader_principled_volume": {
    "blIdname": "ShaderNodeVolumePrincipled",
    "inputs": {
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 0,
        "occurrence": 0
      },
      "density": {
        "name": "Density",
        "identifier": "Density",
        "index": 2,
        "occurrence": 0
      },
      "emissionStrength": {
        "name": "Emission Strength",
        "identifier": "Emission Strength",
        "index": 6,
        "occurrence": 0
      }
    },
    "outputs": {
      "volume": {
        "name": "Volume",
        "identifier": "Volume",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "shader_hair_bsdf": {
    "blIdname": "ShaderNodeBsdfHair",
    "inputs": {
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 0,
        "occurrence": 0
      },
      "roughness": null
    },
    "outputs": {
      "bsdf": {
        "name": "BSDF",
        "identifier": "BSDF",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "shader_principled_hair_bsdf": {
    "blIdname": "ShaderNodeBsdfHairPrincipled",
    "inputs": {
      "melanin": {
        "name": "Melanin",
        "identifier": "Melanin",
        "index": 1,
        "occurrence": 0
      },
      "roughness": {
        "name": "Roughness",
        "identifier": "Roughness",
        "index": 6,
        "occurrence": 0
      }
    },
    "outputs": {
      "bsdf": {
        "name": "BSDF",
        "identifier": "BSDF",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "texture_noise": {
    "blIdname": "ShaderNodeTexNoise",
    "inputs": {
      "vector": {
        "name": "Vector",
        "identifier": "Vector",
        "index": 0,
        "occurrence": 0
      },
      "scale": {
        "name": "Scale",
        "identifier": "Scale",
        "index": 2,
        "occurrence": 0
      },
      "detail": {
        "name": "Detail",
        "identifier": "Detail",
        "index": 3,
        "occurrence": 0
      },
      "roughness": {
        "name": "Roughness",
        "identifier": "Roughness",
        "index": 4,
        "occurrence": 0
      },
      "lacunarity": {
        "name": "Lacunarity",
        "identifier": "Lacunarity",
        "index": 5,
        "occurrence": 0
      },
      "distortion": {
        "name": "Distortion",
        "identifier": "Distortion",
        "index": 8,
        "occurrence": 0
      },
      "offset": {
        "name": "Offset",
        "identifier": "Offset",
        "index": 6,
        "occurrence": 0
      },
      "gain": {
        "name": "Gain",
        "identifier": "Gain",
        "index": 7,
        "occurrence": 0
      }
    },
    "outputs": {
      "fac": {
        "name": "Factor",
        "identifier": "Fac",
        "index": 0,
        "occurrence": 0
      },
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 1,
        "occurrence": 0
      }
    },
    "settings": {
      "noiseType": {
        "special": true
      }
    }
  },
  "texture_white_noise": {
    "blIdname": "ShaderNodeTexWhiteNoise",
    "inputs": {
      "vector": {
        "name": "Vector",
        "identifier": "Vector",
        "index": 0,
        "occurrence": 0
      }
    },
    "outputs": {
      "value": {
        "name": "Value",
        "identifier": "Value",
        "index": 0,
        "occurrence": 0
      },
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 1,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "texture_checker": {
    "blIdname": "ShaderNodeTexChecker",
    "inputs": {
      "vector": {
        "name": "Vector",
        "identifier": "Vector",
        "index": 0,
        "occurrence": 0
      },
      "color1": {
        "name": "Color1",
        "identifier": "Color1",
        "index": 1,
        "occurrence": 0
      },
      "color2": {
        "name": "Color2",
        "identifier": "Color2",
        "index": 2,
        "occurrence": 0
      },
      "scale": {
        "name": "Scale",
        "identifier": "Scale",
        "index": 3,
        "occurrence": 0
      }
    },
    "outputs": {
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 0,
        "occurrence": 0
      },
      "fac": {
        "name": "Factor",
        "identifier": "Fac",
        "index": 1,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "texture_wave": {
    "blIdname": "ShaderNodeTexWave",
    "inputs": {
      "vector": {
        "name": "Vector",
        "identifier": "Vector",
        "index": 0,
        "occurrence": 0
      },
      "scale": {
        "name": "Scale",
        "identifier": "Scale",
        "index": 1,
        "occurrence": 0
      },
      "distortion": {
        "name": "Distortion",
        "identifier": "Distortion",
        "index": 2,
        "occurrence": 0
      },
      "detail": {
        "name": "Detail",
        "identifier": "Detail",
        "index": 3,
        "occurrence": 0
      },
      "detailScale": {
        "name": "Detail Scale",
        "identifier": "Detail Scale",
        "index": 4,
        "occurrence": 0
      },
      "detailRoughness": {
        "name": "Detail Roughness",
        "identifier": "Detail Roughness",
        "index": 5,
        "occurrence": 0
      },
      "phaseOffset": {
        "name": "Phase Offset",
        "identifier": "Phase Offset",
        "index": 6,
        "occurrence": 0
      }
    },
    "outputs": {
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 0,
        "occurrence": 0
      },
      "fac": {
        "name": "Factor",
        "identifier": "Fac",
        "index": 1,
        "occurrence": 0
      }
    },
    "settings": {
      "waveType": {
        "property": "wave_type",
        "values": {
          "bands": "BANDS",
          "rings": "RINGS"
        }
      },
      "direction": {
        "property": "bands_direction",
        "values": {
          "x": "X",
          "y": "Y",
          "z": "Z",
          "diagonal": "DIAGONAL"
        }
      },
      "profile": {
        "property": "wave_profile",
        "values": {
          "sine": "SIN",
          "saw": "SAW",
          "triangle": "TRI"
        }
      }
    }
  },
  "texture_gradient": {
    "blIdname": "ShaderNodeTexGradient",
    "inputs": {
      "vector": {
        "name": "Vector",
        "identifier": "Vector",
        "index": 0,
        "occurrence": 0
      }
    },
    "outputs": {
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 0,
        "occurrence": 0
      },
      "fac": {
        "name": "Factor",
        "identifier": "Fac",
        "index": 1,
        "occurrence": 0
      }
    },
    "settings": {
      "type": {
        "property": "gradient_type",
        "values": {
          "linear": "LINEAR",
          "quadratic": "QUADRATIC",
          "easing": "EASING",
          "diagonal": "DIAGONAL",
          "radial": "RADIAL",
          "spherical": "SPHERICAL"
        }
      }
    }
  },
  "texture_voronoi": {
    "blIdname": "ShaderNodeTexVoronoi",
    "inputs": {
      "vector": {
        "name": "Vector",
        "identifier": "Vector",
        "index": 0,
        "occurrence": 0
      },
      "w": {
        "name": "W",
        "identifier": "W",
        "index": 1,
        "occurrence": 0
      },
      "scale": {
        "name": "Scale",
        "identifier": "Scale",
        "index": 2,
        "occurrence": 0
      },
      "detail": {
        "name": "Detail",
        "identifier": "Detail",
        "index": 3,
        "occurrence": 0
      },
      "roughness": {
        "name": "Roughness",
        "identifier": "Roughness",
        "index": 4,
        "occurrence": 0
      },
      "lacunarity": {
        "name": "Lacunarity",
        "identifier": "Lacunarity",
        "index": 5,
        "occurrence": 0
      },
      "smoothness": {
        "name": "Smoothness",
        "identifier": "Smoothness",
        "index": 6,
        "occurrence": 0
      },
      "exponent": {
        "name": "Exponent",
        "identifier": "Exponent",
        "index": 7,
        "occurrence": 0
      },
      "randomness": {
        "name": "Randomness",
        "identifier": "Randomness",
        "index": 8,
        "occurrence": 0
      }
    },
    "outputs": {
      "distance": {
        "name": "Distance",
        "identifier": "Distance",
        "index": 0,
        "occurrence": 0
      },
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 1,
        "occurrence": 0
      },
      "position": {
        "name": "Position",
        "identifier": "Position",
        "index": 2,
        "occurrence": 0
      },
      "w": {
        "name": "W",
        "identifier": "W",
        "index": 3,
        "occurrence": 0
      },
      "radius": {
        "name": "Radius",
        "identifier": "Radius",
        "index": 4,
        "occurrence": 0
      }
    },
    "settings": {
      "dimensions": {
        "property": "voronoi_dimensions",
        "values": {
          "1d": "1D",
          "2d": "2D",
          "3d": "3D",
          "4d": "4D"
        }
      },
      "feature": {
        "property": "feature",
        "values": {
          "f1": "F1",
          "f2": "F2",
          "smooth_f1": "SMOOTH_F1",
          "distance_to_edge": "DISTANCE_TO_EDGE",
          "n_sphere_radius": "N_SPHERE_RADIUS"
        }
      },
      "distanceMetric": {
        "property": "distance",
        "values": {
          "euclidean": "EUCLIDEAN",
          "manhattan": "MANHATTAN",
          "chebychev": "CHEBYCHEV",
          "minkowski": "MINKOWSKI"
        }
      }
    }
  },
  "texture_magic": {
    "blIdname": "ShaderNodeTexMagic",
    "inputs": {
      "vector": {
        "name": "Vector",
        "identifier": "Vector",
        "index": 0,
        "occurrence": 0
      },
      "scale": {
        "name": "Scale",
        "identifier": "Scale",
        "index": 1,
        "occurrence": 0
      },
      "distortion": {
        "name": "Distortion",
        "identifier": "Distortion",
        "index": 2,
        "occurrence": 0
      }
    },
    "outputs": {
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 0,
        "occurrence": 0
      },
      "fac": {
        "name": "Factor",
        "identifier": "Fac",
        "index": 1,
        "occurrence": 0
      }
    },
    "settings": {
      "depth": {
        "property": "turbulence_depth",
        "values": {}
      }
    }
  },
  "texture_brick": {
    "blIdname": "ShaderNodeTexBrick",
    "inputs": {
      "vector": {
        "name": "Vector",
        "identifier": "Vector",
        "index": 0,
        "occurrence": 0
      },
      "color1": {
        "name": "Color1",
        "identifier": "Color1",
        "index": 1,
        "occurrence": 0
      },
      "color2": {
        "name": "Color2",
        "identifier": "Color2",
        "index": 2,
        "occurrence": 0
      },
      "mortarColor": null,
      "scale": {
        "name": "Scale",
        "identifier": "Scale",
        "index": 4,
        "occurrence": 0
      },
      "mortarSize": {
        "name": "Mortar Size",
        "identifier": "Mortar Size",
        "index": 5,
        "occurrence": 0
      },
      "mortarSmooth": {
        "name": "Mortar Smooth",
        "identifier": "Mortar Smooth",
        "index": 6,
        "occurrence": 0
      },
      "bias": {
        "name": "Bias",
        "identifier": "Bias",
        "index": 7,
        "occurrence": 0
      },
      "brickWidth": {
        "name": "Brick Width",
        "identifier": "Brick Width",
        "index": 8,
        "occurrence": 0
      },
      "rowHeight": {
        "name": "Row Height",
        "identifier": "Row Height",
        "index": 9,
        "occurrence": 0
      },
      "offset": null,
      "offsetFrequency": null,
      "squash": null,
      "squashFrequency": null
    },
    "outputs": {
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 0,
        "occurrence": 0
      },
      "fac": {
        "name": "Factor",
        "identifier": "Fac",
        "index": 1,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "texture_image": {
    "blIdname": "ShaderNodeTexImage",
    "inputs": {
      "vector": {
        "name": "Vector",
        "identifier": "Vector",
        "index": 0,
        "occurrence": 0
      }
    },
    "outputs": {
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 0,
        "occurrence": 0
      },
      "alpha": {
        "name": "Alpha",
        "identifier": "Alpha",
        "index": 1,
        "occurrence": 0
      }
    },
    "settings": {
      "src": {
        "special": true
      },
      "extension": {
        "property": "extension",
        "values": {
          "repeat": "REPEAT",
          "extend": "EXTEND",
          "clip": "CLIP",
          "mirror": "MIRROR"
        }
      },
      "interpolation": {
        "property": "interpolation",
        "values": {
          "linear": "Linear",
          "closest": "Closest",
          "cubic": "Cubic"
        }
      },
      "colorSpace": {
        "special": true
      }
    }
  },
  "texture_environment": {
    "blIdname": "ShaderNodeTexEnvironment",
    "inputs": {
      "vector": {
        "name": "Vector",
        "identifier": "Vector",
        "index": 0,
        "occurrence": 0
      }
    },
    "outputs": {
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "texture_sky": {
    "blIdname": "ShaderNodeTexSky",
    "inputs": {},
    "outputs": {
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "texture_ies": {
    "blIdname": "ShaderNodeTexIES",
    "inputs": {},
    "outputs": {
      "fac": {
        "name": "Factor",
        "identifier": "Fac",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "color_hsv": {
    "blIdname": "ShaderNodeHueSaturation",
    "inputs": {
      "hue": {
        "name": "Hue",
        "identifier": "Hue",
        "index": 0,
        "occurrence": 0
      },
      "saturation": {
        "name": "Saturation",
        "identifier": "Saturation",
        "index": 1,
        "occurrence": 0
      },
      "value": {
        "name": "Value",
        "identifier": "Value",
        "index": 2,
        "occurrence": 0
      },
      "fac": {
        "name": "Factor",
        "identifier": "Fac",
        "index": 3,
        "occurrence": 0
      },
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 4,
        "occurrence": 0
      }
    },
    "outputs": {
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "color_invert": {
    "blIdname": "ShaderNodeInvert",
    "inputs": {
      "fac": {
        "name": "Factor",
        "identifier": "Fac",
        "index": 0,
        "occurrence": 0
      },
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 1,
        "occurrence": 0
      }
    },
    "outputs": {
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "color_bright_contrast": {
    "blIdname": "ShaderNodeBrightContrast",
    "inputs": {
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 0,
        "occurrence": 0
      },
      "bright": {
        "name": "Brightness",
        "identifier": "Bright",
        "index": 1,
        "occurrence": 0
      },
      "contrast": {
        "name": "Contrast",
        "identifier": "Contrast",
        "index": 2,
        "occurrence": 0
      }
    },
    "outputs": {
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "color_gamma": {
    "blIdname": "ShaderNodeGamma",
    "inputs": {
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 0,
        "occurrence": 0
      },
      "gamma": {
        "name": "Gamma",
        "identifier": "Gamma",
        "index": 1,
        "occurrence": 0
      }
    },
    "outputs": {
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "color_mix": {
    "blIdname": "ShaderNodeMix",
    "inputs": {
      "fac": {
        "name": "Factor",
        "identifier": "Factor_Float",
        "index": 0,
        "occurrence": 0
      },
      "a": {
        "name": "A",
        "identifier": "A_Color",
        "index": 6,
        "occurrence": 0
      },
      "b": {
        "name": "B",
        "identifier": "B_Color",
        "index": 7,
        "occurrence": 0
      }
    },
    "outputs": {
      "color": {
        "name": "Result",
        "identifier": "Result_Color",
        "index": 2,
        "occurrence": 0
      }
    },
    "settings": {
      "mode": {
        "property": "blend_type",
        "values": {
          "mix": "MIX",
          "darken": "DARKEN",
          "multiply": "MULTIPLY",
          "burn": "BURN",
          "lighten": "LIGHTEN",
          "screen": "SCREEN",
          "dodge": "DODGE",
          "add": "ADD",
          "overlay": "OVERLAY",
          "soft_light": "SOFT_LIGHT",
          "linear_light": "LINEAR_LIGHT",
          "difference": "DIFFERENCE",
          "exclusion": "EXCLUSION",
          "subtract": "SUBTRACT",
          "divide": "DIVIDE",
          "hue": "HUE",
          "saturation": "SATURATION",
          "color": "COLOR",
          "value": "VALUE"
        }
      },
      "clampFactor": {
        "property": "clamp_factor",
        "values": {}
      },
      "clampResult": {
        "property": "clamp_result",
        "values": {}
      }
    }
  },
  "color_rgb_curves": {
    "blIdname": "ShaderNodeRGBCurve",
    "inputs": {
      "fac": {
        "name": "Factor",
        "identifier": "Fac",
        "index": 0,
        "occurrence": 0
      },
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 1,
        "occurrence": 0
      }
    },
    "outputs": {
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {
      "points": {
        "special": true
      },
      "pointsR": {
        "special": true
      },
      "pointsG": {
        "special": true
      },
      "pointsB": {
        "special": true
      }
    }
  },
  "color_light_falloff": {
    "blIdname": "ShaderNodeLightFalloff",
    "inputs": {
      "strength": {
        "name": "Strength",
        "identifier": "Strength",
        "index": 0,
        "occurrence": 0
      }
    },
    "outputs": {
      "quadratic": {
        "name": "Quadratic",
        "identifier": "Quadratic",
        "index": 0,
        "occurrence": 0
      },
      "linear": {
        "name": "Linear",
        "identifier": "Linear",
        "index": 1,
        "occurrence": 0
      },
      "constant": {
        "name": "Constant",
        "identifier": "Constant",
        "index": 2,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "vector_mapping": {
    "blIdname": "ShaderNodeMapping",
    "inputs": {
      "vector": {
        "name": "Vector",
        "identifier": "Vector",
        "index": 0,
        "occurrence": 0
      },
      "location": {
        "name": "Location",
        "identifier": "Location",
        "index": 1,
        "occurrence": 0
      },
      "rotation": {
        "name": "Rotation",
        "identifier": "Rotation",
        "index": 2,
        "occurrence": 0
      },
      "scale": {
        "name": "Scale",
        "identifier": "Scale",
        "index": 3,
        "occurrence": 0
      }
    },
    "outputs": {
      "vector": {
        "name": "Vector",
        "identifier": "Vector",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {
      "mappingType": {
        "property": "vector_type",
        "values": {
          "point": "POINT",
          "texture": "TEXTURE",
          "vector": "VECTOR",
          "normal": "NORMAL"
        }
      }
    }
  },
  "vector_bump": {
    "blIdname": "ShaderNodeBump",
    "inputs": {
      "strength": {
        "name": "Strength",
        "identifier": "Strength",
        "index": 0,
        "occurrence": 0
      },
      "distance": {
        "name": "Distance",
        "identifier": "Distance",
        "index": 1,
        "occurrence": 0
      },
      "filterWidth": {
        "name": "Filter Width",
        "identifier": "Filter Width",
        "index": 2,
        "occurrence": 0
      },
      "height": {
        "name": "Height",
        "identifier": "Height",
        "index": 3,
        "occurrence": 0
      },
      "normal": {
        "name": "Normal",
        "identifier": "Normal",
        "index": 4,
        "occurrence": 0
      }
    },
    "outputs": {
      "normal": {
        "name": "Normal",
        "identifier": "Normal",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {
      "invert": {
        "property": "invert",
        "values": {}
      }
    }
  },
  "vector_math": {
    "blIdname": "ShaderNodeVectorMath",
    "inputs": {
      "vector1": {
        "name": "Vector",
        "identifier": "Vector",
        "index": 0,
        "occurrence": 0
      },
      "vector2": {
        "name": "Vector",
        "identifier": "Vector_001",
        "index": 1,
        "occurrence": 1
      },
      "vector3": {
        "name": "Vector",
        "identifier": "Vector_002",
        "index": 2,
        "occurrence": 2
      },
      "scale": {
        "name": "Scale",
        "identifier": "Scale",
        "index": 3,
        "occurrence": 0
      }
    },
    "outputs": {
      "vector": {
        "name": "Vector",
        "identifier": "Vector",
        "index": 0,
        "occurrence": 0
      },
      "value": {
        "name": "Value",
        "identifier": "Value",
        "index": 1,
        "occurrence": 0
      }
    },
    "settings": {
      "operation": {
        "property": "operation",
        "values": {
          "add": "ADD",
          "subtract": "SUBTRACT",
          "multiply": "MULTIPLY",
          "divide": "DIVIDE",
          "multiply_add": "MULTIPLY_ADD",
          "cross": "CROSS_PRODUCT",
          "project": "PROJECT",
          "reflect": "REFLECT",
          "refract": "REFRACT",
          "faceforward": "FACEFORWARD",
          "dot": "DOT_PRODUCT",
          "distance": "DISTANCE",
          "length": "LENGTH",
          "scale": "SCALE",
          "normalize": "NORMALIZE",
          "absolute": "ABSOLUTE",
          "minimum": "MINIMUM",
          "maximum": "MAXIMUM",
          "floor": "FLOOR",
          "ceil": "CEIL",
          "round": "ROUND",
          "fraction": "FRACTION",
          "modulo": "MODULO",
          "wrap": "WRAP",
          "snap": "SNAP",
          "sine": "SINE",
          "cosine": "COSINE",
          "tangent": "TANGENT"
        }
      }
    }
  },
  "vector_rotate": {
    "blIdname": "ShaderNodeVectorRotate",
    "inputs": {
      "vector": {
        "name": "Vector",
        "identifier": "Vector",
        "index": 0,
        "occurrence": 0
      },
      "center": {
        "name": "Center",
        "identifier": "Center",
        "index": 1,
        "occurrence": 0
      },
      "axis": {
        "name": "Axis",
        "identifier": "Axis",
        "index": 2,
        "occurrence": 0
      },
      "angle": {
        "name": "Angle",
        "identifier": "Angle",
        "index": 3,
        "occurrence": 0
      },
      "rotation": {
        "name": "Rotation",
        "identifier": "Rotation",
        "index": 4,
        "occurrence": 0
      }
    },
    "outputs": {
      "vector": {
        "name": "Vector",
        "identifier": "Vector",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {
      "rotationType": {
        "property": "rotation_type",
        "values": {
          "axis": "AXIS_ANGLE",
          "x": "X_AXIS",
          "y": "Y_AXIS",
          "z": "Z_AXIS",
          "euler_xyz": "EULER_XYZ"
        }
      }
    }
  },
  "vector_normal_map": {
    "blIdname": "ShaderNodeNormalMap",
    "inputs": {
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 1,
        "occurrence": 0
      },
      "strength": {
        "name": "Strength",
        "identifier": "Strength",
        "index": 0,
        "occurrence": 0
      }
    },
    "outputs": {
      "normal": {
        "name": "Normal",
        "identifier": "Normal",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {
      "convention": {
        "special": true
      }
    }
  },
  "vector_displacement": {
    "blIdname": "ShaderNodeDisplacement",
    "inputs": {
      "height": {
        "name": "Height",
        "identifier": "Height",
        "index": 0,
        "occurrence": 0
      },
      "midlevel": {
        "name": "Midlevel",
        "identifier": "Midlevel",
        "index": 1,
        "occurrence": 0
      },
      "scale": {
        "name": "Scale",
        "identifier": "Scale",
        "index": 2,
        "occurrence": 0
      },
      "normal": {
        "name": "Normal",
        "identifier": "Normal",
        "index": 3,
        "occurrence": 0
      }
    },
    "outputs": {
      "displacement": {
        "name": "Displacement",
        "identifier": "Displacement",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "vector_displacement_vec": {
    "blIdname": "ShaderNodeVectorDisplacement",
    "inputs": {
      "vector": {
        "name": "Vector",
        "identifier": "Vector",
        "index": 0,
        "occurrence": 0
      },
      "midlevel": {
        "name": "Midlevel",
        "identifier": "Midlevel",
        "index": 1,
        "occurrence": 0
      },
      "scale": {
        "name": "Scale",
        "identifier": "Scale",
        "index": 2,
        "occurrence": 0
      }
    },
    "outputs": {
      "displacement": {
        "name": "Displacement",
        "identifier": "Displacement",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {
      "space": {
        "property": "space",
        "values": {
          "tangent": "TANGENT",
          "object": "OBJECT",
          "world": "WORLD"
        }
      }
    }
  },
  "vector_curves": {
    "blIdname": "ShaderNodeVectorCurve",
    "inputs": {
      "fac": {
        "name": "Factor",
        "identifier": "Fac",
        "index": 0,
        "occurrence": 0
      },
      "vector": {
        "name": "Vector",
        "identifier": "Vector",
        "index": 1,
        "occurrence": 0
      }
    },
    "outputs": {
      "vector": {
        "name": "Vector",
        "identifier": "Vector",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {
      "points": {
        "special": true
      },
      "pointsY": {
        "special": true
      },
      "pointsZ": {
        "special": true
      }
    }
  },
  "vector_transform": {
    "blIdname": "ShaderNodeVectorTransform",
    "inputs": {
      "vector": {
        "name": "Vector",
        "identifier": "Vector",
        "index": 0,
        "occurrence": 0
      }
    },
    "outputs": {
      "vector": {
        "name": "Vector",
        "identifier": "Vector",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {
      "from": {
        "property": "convert_from",
        "values": {
          "object": "OBJECT",
          "world": "WORLD",
          "camera": "CAMERA"
        }
      },
      "to": {
        "property": "convert_to",
        "values": {
          "object": "OBJECT",
          "world": "WORLD",
          "camera": "CAMERA"
        }
      }
    }
  },
  "vector_normal": {
    "blIdname": "ShaderNodeNormal",
    "inputs": {
      "normal": {
        "name": "Normal",
        "identifier": "Normal",
        "index": 0,
        "occurrence": 0
      }
    },
    "outputs": {
      "normal": {
        "name": "Normal",
        "identifier": "Normal",
        "index": 0,
        "occurrence": 0
      },
      "dot": {
        "name": "Dot",
        "identifier": "Dot",
        "index": 1,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "converter_math": {
    "blIdname": "ShaderNodeMath",
    "inputs": {
      "value1": {
        "name": "Value",
        "identifier": "Value",
        "index": 0,
        "occurrence": 0
      },
      "value2": {
        "name": "Value",
        "identifier": "Value_001",
        "index": 1,
        "occurrence": 1
      },
      "value3": {
        "name": "Value",
        "identifier": "Value_002",
        "index": 2,
        "occurrence": 2
      }
    },
    "outputs": {
      "value": {
        "name": "Value",
        "identifier": "Value",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {
      "operation": {
        "property": "operation",
        "values": {
          "add": "ADD",
          "subtract": "SUBTRACT",
          "multiply": "MULTIPLY",
          "multiply_add": "MULTIPLY_ADD",
          "divide": "DIVIDE",
          "power": "POWER",
          "logarithm": "LOGARITHM",
          "sqrt": "SQRT",
          "inverse_sqrt": "INVERSE_SQRT",
          "absolute": "ABSOLUTE",
          "exponent": "EXPONENT",
          "minimum": "MINIMUM",
          "maximum": "MAXIMUM",
          "less_than": "LESS_THAN",
          "greater_than": "GREATER_THAN",
          "sign": "SIGN",
          "compare": "COMPARE",
          "smooth_min": "SMOOTH_MIN",
          "smooth_max": "SMOOTH_MAX",
          "round": "ROUND",
          "floor": "FLOOR",
          "ceil": "CEIL",
          "truncate": "TRUNC",
          "fraction": "FRACT",
          "modulo": "MODULO",
          "floored_modulo": "FLOORED_MODULO",
          "wrap": "WRAP",
          "snap": "SNAP",
          "ping_pong": "PINGPONG",
          "sine": "SINE",
          "cosine": "COSINE",
          "tangent": "TANGENT",
          "arcsine": "ARCSINE",
          "arccosine": "ARCCOSINE",
          "arctangent": "ARCTANGENT",
          "arctan2": "ARCTAN2",
          "hyperbolic_sine": "SINH",
          "hyperbolic_cosine": "COSH",
          "hyperbolic_tangent": "TANH",
          "to_radians": "RADIANS",
          "to_degrees": "DEGREES"
        }
      },
      "clamp": {
        "property": "use_clamp",
        "values": {}
      }
    }
  },
  "converter_color_ramp": {
    "blIdname": "ShaderNodeValToRGB",
    "inputs": {
      "fac": {
        "name": "Factor",
        "identifier": "Fac",
        "index": 0,
        "occurrence": 0
      }
    },
    "outputs": {
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 0,
        "occurrence": 0
      },
      "alpha": {
        "name": "Alpha",
        "identifier": "Alpha",
        "index": 1,
        "occurrence": 0
      }
    },
    "settings": {
      "colorMode": {
        "special": true
      },
      "hueInterp": {
        "special": true
      },
      "interpolation": {
        "special": true
      },
      "stops": {
        "special": true
      }
    }
  },
  "converter_clamp": {
    "blIdname": "ShaderNodeClamp",
    "inputs": {
      "value": {
        "name": "Value",
        "identifier": "Value",
        "index": 0,
        "occurrence": 0
      },
      "min": {
        "name": "Min",
        "identifier": "Min",
        "index": 1,
        "occurrence": 0
      },
      "max": {
        "name": "Max",
        "identifier": "Max",
        "index": 2,
        "occurrence": 0
      }
    },
    "outputs": {
      "value": {
        "name": "Result",
        "identifier": "Result",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {
      "clampType": {
        "property": "clamp_type",
        "values": {
          "minmax": "MINMAX",
          "range": "RANGE"
        }
      }
    }
  },
  "converter_map_range": {
    "blIdname": "ShaderNodeMapRange",
    "inputs": {
      "value": {
        "name": "Value",
        "identifier": "Value",
        "index": 0,
        "occurrence": 0
      },
      "fromMin": {
        "name": "From Min",
        "identifier": "From Min",
        "index": 1,
        "occurrence": 0
      },
      "fromMax": {
        "name": "From Max",
        "identifier": "From Max",
        "index": 2,
        "occurrence": 0
      },
      "toMin": {
        "name": "To Min",
        "identifier": "To Min",
        "index": 3,
        "occurrence": 0
      },
      "toMax": {
        "name": "To Max",
        "identifier": "To Max",
        "index": 4,
        "occurrence": 0
      },
      "steps": {
        "name": "Steps",
        "identifier": "Steps",
        "index": 5,
        "occurrence": 0
      }
    },
    "outputs": {
      "value": {
        "name": "Result",
        "identifier": "Result",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {
      "interpolationType": {
        "property": "interpolation_type",
        "values": {
          "linear": "LINEAR",
          "stepped": "STEPPED",
          "smoothstep": "SMOOTHSTEP",
          "smootherstep": "SMOOTHERSTEP"
        }
      },
      "clamp": {
        "property": "clamp",
        "values": {}
      }
    }
  },
  "converter_combine_xyz": {
    "blIdname": "ShaderNodeCombineXYZ",
    "inputs": {
      "x": {
        "name": "X",
        "identifier": "X",
        "index": 0,
        "occurrence": 0
      },
      "y": {
        "name": "Y",
        "identifier": "Y",
        "index": 1,
        "occurrence": 0
      },
      "z": {
        "name": "Z",
        "identifier": "Z",
        "index": 2,
        "occurrence": 0
      }
    },
    "outputs": {
      "vector": {
        "name": "Vector",
        "identifier": "Vector",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "converter_separate_xyz": {
    "blIdname": "ShaderNodeSeparateXYZ",
    "inputs": {
      "vector": {
        "name": "Vector",
        "identifier": "Vector",
        "index": 0,
        "occurrence": 0
      }
    },
    "outputs": {
      "x": {
        "name": "X",
        "identifier": "X",
        "index": 0,
        "occurrence": 0
      },
      "y": {
        "name": "Y",
        "identifier": "Y",
        "index": 1,
        "occurrence": 0
      },
      "z": {
        "name": "Z",
        "identifier": "Z",
        "index": 2,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "converter_combine_color": {
    "blIdname": "ShaderNodeCombineColor",
    "inputs": {
      "r": null,
      "g": null,
      "b": null,
      "a": null
    },
    "outputs": {
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {
      "mode": {
        "property": "mode",
        "values": {
          "rgb": "RGB",
          "hsv": "HSV",
          "hsl": "HSL"
        }
      }
    }
  },
  "converter_separate_color": {
    "blIdname": "ShaderNodeSeparateColor",
    "inputs": {
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 0,
        "occurrence": 0
      }
    },
    "outputs": {
      "r": null,
      "g": null,
      "b": null,
      "a": null
    },
    "settings": {
      "mode": {
        "property": "mode",
        "values": {
          "rgb": "RGB",
          "hsv": "HSV",
          "hsl": "HSL"
        }
      }
    }
  },
  "converter_rgb_to_bw": {
    "blIdname": "ShaderNodeRGBToBW",
    "inputs": {
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 0,
        "occurrence": 0
      }
    },
    "outputs": {
      "value": {
        "name": "Val",
        "identifier": "Val",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "converter_wavelength": {
    "blIdname": "ShaderNodeWavelength",
    "inputs": {
      "wavelength": {
        "name": "Wavelength",
        "identifier": "Wavelength",
        "index": 0,
        "occurrence": 0
      }
    },
    "outputs": {
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "converter_blackbody": {
    "blIdname": "ShaderNodeBlackbody",
    "inputs": {
      "temperature": {
        "name": "Temperature",
        "identifier": "Temperature",
        "index": 0,
        "occurrence": 0
      }
    },
    "outputs": {
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {}
  },
  "converter_float_curve": {
    "blIdname": "ShaderNodeFloatCurve",
    "inputs": {
      "fac": {
        "name": "Factor",
        "identifier": "Factor",
        "index": 0,
        "occurrence": 0
      },
      "value": {
        "name": "Value",
        "identifier": "Value",
        "index": 1,
        "occurrence": 0
      }
    },
    "outputs": {
      "value": {
        "name": "Value",
        "identifier": "Value",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {
      "points": {
        "special": true
      }
    }
  },
  "converter_shader_to_rgb": {
    "blIdname": "ShaderNodeShaderToRGB",
    "inputs": {
      "shader": {
        "name": "Shader",
        "identifier": "Shader",
        "index": 0,
        "occurrence": 0
      }
    },
    "outputs": {
      "color": {
        "name": "Color",
        "identifier": "Color",
        "index": 0,
        "occurrence": 0
      }
    },
    "settings": {}
  }
};
