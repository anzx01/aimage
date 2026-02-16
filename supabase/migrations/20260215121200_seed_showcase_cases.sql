-- Insert initial showcase cases data
-- Sample cases for the showcase library

INSERT INTO showcase_cases (title, description, category, model_version, thumbnail_url, video_url, tags, is_featured) VALUES
  (
    '金铆钉骷髅耳环 - UGC带货视频',
    '使用Sora2生成的产品展示视频，展示金铆钉骷髅耳环的细节和佩戴效果',
    '美妆个护',
    'Sora2',
    'https://picsum.photos/seed/earring-showcase/800/600',
    'https://picsum.photos/seed/earring-video/800/600',
    ARRAY['饰品', '耳环', 'UGC', '带货'],
    true
  ),
  (
    '女式内衣产品展示',
    '使用Veo3.1生成的女式内衣产品视频，突出舒适性和设计感',
    '女式内衣',
    'Veo3.1 Fast',
    'https://picsum.photos/seed/lingerie-showcase/800/600',
    'https://picsum.photos/seed/lingerie-video/800/600',
    ARRAY['内衣', '女装', '产品展示'],
    true
  ),
  (
    '家居家纺 - 床品套装',
    '温馨家居场景视频，展示床品套装的质感和搭配效果',
    '家居家纺',
    'Sora2',
    'https://picsum.photos/seed/bedding-showcase/800/600',
    'https://picsum.photos/seed/bedding-video/800/600',
    ARRAY['家居', '床品', '生活方式'],
    false
  ),
  (
    '数字人口播 - 护肤品推荐',
    '使用高级数字人生成的护肤品推荐视频，专业且亲切',
    '美妆个护',
    'Veo3',
    'https://picsum.photos/seed/skincare-showcase/800/600',
    'https://picsum.photos/seed/skincare-video/800/600',
    ARRAY['护肤', '数字人', '口播'],
    true
  ),
  (
    '运动鞋产品测评',
    '动态展示运动鞋的设计细节和穿着效果',
    '鞋靴箱包',
    'Sora2',
    'https://picsum.photos/seed/shoes-showcase/800/600',
    'https://picsum.photos/seed/shoes-video/800/600',
    ARRAY['运动鞋', '测评', '产品展示'],
    false
  );

