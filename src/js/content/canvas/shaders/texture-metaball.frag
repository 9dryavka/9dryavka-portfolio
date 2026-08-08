// Three.jsと競合するので一部処理はコメントアウト
// #version 300 es

precision highp float;
precision highp sampler2DArray;

// ShaderMaterial生成時に追加
// #define BALL_COUNT ${objectControllers.length}
// #define THRESHOLD ${THRESHOLD}
// #define MARGIN ${MARGIN}

in vec2 vUv;

uniform vec2 uResolution;
uniform vec2 uTextureResolution;
uniform sampler2DArray uTextures;
uniform int uObjectCount;

struct Metaball {
    vec2 coordinates;
    float size;
    float scale;
    float opacity;
};

uniform Metaball uObjects[BALL_COUNT];

out vec4 outColor;

float metaball(vec2 uv) {

    float field = 0.0;

    float aspect = uResolution.x / uResolution.y;

    // UVを補正
    uv.x *= aspect;

    for (int i = 0; i < BALL_COUNT; i++) {

        if (i >= uObjectCount) {
            break;
        }

        Metaball metaball = uObjects[i];

        // ボール座標も補正
        vec2 center = metaball.coordinates;
        center.x *= aspect;

        float radius = metaball.size * metaball.scale;

        float d = distance(uv, center);

        field += metaball.opacity * (radius * radius) / (d * d + MARGIN);
    }

    return field;
}

void main() {

    // 0～100 の相対座標へ変換
    vec2 uv = vUv * 100.0;

    float field = metaball(uv);

    float mask =  step(THRESHOLD, field);

    // -------- テクスチャのアスペクト比を維持 --------

    vec2 texUv = vUv;

    float screenAspect = uResolution.x / uResolution.y;
    float textureAspect = uTextureResolution.x / uTextureResolution.y;

    if (screenAspect > textureAspect) {
        // 画面が横長
        float scale = textureAspect / screenAspect;
        texUv.x = (texUv.x - 0.5) * scale + 0.5;
    } else {
        // 画面が縦長
        float scale = screenAspect / textureAspect;
        texUv.y = (texUv.y - 0.5) * scale + 0.5;
    }

    vec4 tex = vec4(0.0);

    if (
        texUv.x >= 0.0 && texUv.x <= 1.0 &&
        texUv.y >= 0.0 && texUv.y <= 1.0
    ) {
        tex = texture(uTextures, vec3(texUv, 0));
    }

    outColor = vec4(tex.rgb, tex.a * mask);
}