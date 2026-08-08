export const CONTENT_TYPE = {
  HTML: "HTML",
  GENERATE_HTML: "GENERATE_HTML",
  EXTERNAL_PAGE: "EXTERNAL_PAGE",
};

export const GENERATOR_TYPE = {
  TABLE: "TABLE",
};

export const CONTENT_DEFINES = {
  id: "content",
  title: "コンテンツ一覧",
  children: [
    {
      id: "self-introduction",
      title: "自己紹介",
      content: {
        type: CONTENT_TYPE.HTML,
        resource: "self-introduction.html",
      },
    },
    {
      id: "skill",
      title: "スキル",
      content: {
        type: CONTENT_TYPE.GENERATE_HTML,
        generator: GENERATOR_TYPE.TABLE,
        resource: "skill.json",
      },
    },
    {
      id: "certification",
      title: "資格",
      content: {
        type: CONTENT_TYPE.GENERATE_HTML,
        generator: GENERATOR_TYPE.TABLE,
        resource: "certification.json",
      },
    },
    {
      id: "work",
      title: "作ったモノ",
      data: {
        "parallel-window": {
          size: { width: 1920, height: 1080 },
          texture: {
            "work-blog-frontend": "resources/work_blog.jpg",
            "work-blog-backend": "resources/blog_backend.png",
            "work-cloud-infra": "resources/work_infra.png",
            "work-portfolio": "resources/work_portfolio.jpg",
          },
        },
      },
      children: [
        {
          id: "work-blog-frontend",
          title: "個人ブログ(フロントエンド)",
          titleLink: [
            {
              url: "https://magiarium.info/",
              target: "_blank",
              icon: {
                src: "/assets/logo.svg",
                alt: "ロゴアイコン",
                width: "20",
                height: "20",
              },
            },
            {
              url: "https://github.com/magiarium/magiarium-client",
              target: "_blank",
              icon: {
                src: "/assets/GitHub_Invertocat_Black.svg",
                alt: "Gitアイコン",
                width: "20",
                height: "20",
              },
            },
          ],
          content: {
            type: CONTENT_TYPE.HTML,
            resource: "work/blog-frontend.html",
          },
        },
        {
          id: "work-blog-backend",
          title: "個人ブログ(バックエンド)",
          titleLink: [
            {
              url: "https://github.com/magiarium/magiarium-api",
              target: "_blank",
              icon: {
                src: "/assets/GitHub_Invertocat_Black.svg",
                alt: "Gitアイコン",
                width: "20",
                height: "20",
              },
            },
          ],
          content: {
            type: CONTENT_TYPE.HTML,
            resource: "work/blog-backend.html",
          },
        },
        {
          id: "work-cloud-infra",
          title: "クラウドインフラ",
          titleLink: [
            {
              url: "https://github.com/magiarium/magiarium-client/blob/master/template.yaml",
              target: "_blank",
              icon: {
                src: "/assets/GitHub_Invertocat_Black.svg",
                alt: "Gitアイコン",
                width: "20",
                height: "20",
              },
            },
            {
              url: "https://github.com/magiarium/magiarium-api/blob/master/template.yaml",
              target: "_blank",
              icon: {
                src: "/assets/GitHub_Invertocat_Black.svg",
                alt: "Gitアイコン",
                width: "20",
                height: "20",
              },
            },
          ],
          content: {
            type: CONTENT_TYPE.HTML,
            resource: "work/cloud-infra.html",
          },
        },
        {
          id: "work-portfolio",
          title: "ポートフォリオ",
          titleLink: [
            {
              url: "https://github.com/9dryavka/my-portfolio",
              target: "_blank",
              icon: {
                src: "/assets/GitHub_Invertocat_Black.svg",
                alt: "Gitアイコン",
                width: "20",
                height: "20",
              },
            },
          ],
          content: {
            type: CONTENT_TYPE.HTML,
            resource: "work/portfolio.html",
          },
        },
      ],
    },
  ],
};
