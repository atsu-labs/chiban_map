// PMTilesプロトコルの登録
let protocol = new pmtiles.Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);

// 地図の初期化
const map = new maplibregl.Map({
    container: 'map',
    style: {
        version: 8,
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
        sources: {
            'osm': {
                type: 'raster',
                tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: '© OpenStreetMap contributors'
            },
            'gsi-std': {
                type: 'raster',
                tiles: ['https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>'
            },
            'gsi-photo': {
                type: 'raster',
                tiles: ['https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg'],
                tileSize: 256,
                attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>'
            },
            'pmtiles': {
                type: 'vector',
                url: 'pmtiles://output.pmtiles',
                attribution: 'PMTiles data'
            },
            'chou': {
                type: 'geojson',
                data: 'chou.geojson',
                generateId: true
            }
        },
        layers: [
            {
                id: 'osm',
                type: 'raster',
                source: 'osm',
                minzoom: 0,
                maxzoom: 22
            },
            {
                id: 'gsi-std',
                type: 'raster',
                source: 'gsi-std',
                minzoom: 0,
                maxzoom: 22,
                layout: {
                    visibility: 'none'
                }
            },
            {
                id: 'gsi-photo',
                type: 'raster',
                source: 'gsi-photo',
                minzoom: 0,
                maxzoom: 22,
                layout: {
                    visibility: 'none'
                }
            },
            {
                id: 'pmtiles-fill',
                type: 'fill',
                source: 'pmtiles',
                'source-layer': 'EPSG6668',
                minzoom: 15,
                paint: {
                    'fill-color': [
                        'match',
                        ['get', '座標系'],
                        '任意座標系', '#ff6b6b',  // 赤系
                        '公共座標11系', '#4dabf7', // 青系
                        '#95a5a6' // デフォルト（灰色）
                    ],
                    'fill-opacity': 0.5
                }
            },
            {
                id: 'pmtiles-fill-hover',
                type: 'fill',
                source: 'pmtiles',
                'source-layer': 'EPSG6668',
                minzoom: 15,
                filter: ['==', '市区町村C', ''],
                paint: {
                    'fill-color': '#ffff00',
                    'fill-opacity': 0.8
                }
            },
            {
                id: 'pmtiles-line',
                type: 'line',
                source: 'pmtiles',
                'source-layer': 'EPSG6668',
                minzoom: 15,
                paint: {
                    'line-color': [
                        'match',
                        ['get', '座標系'],
                        '任意座標系', '#c92a2a',  // 濃い赤
                        '公共座標11系', '#1971c2', // 濃い青
                        '#495057' // デフォルト（濃い灰色）
                    ],
                    'line-width': 2
                }
            },
            {
                id: 'chou-fill',
                type: 'fill',
                source: 'chou',
                minzoom: 12,
                maxzoom: 15,
                paint: {
                    'fill-color': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false],
                        '#ffff00',  // ホバー時は黄色
                        [
                            'case',
                            ['has', 'color_id'],
                            // color_idを使って視認性の高い6色のカラーパレットから色を選択
                            [
                                'match',
                                ['get', 'color_id'],
                                1, '#ff6b6b',   // レッド
                                2, '#4dabf7',   // ブルー
                                3, '#51cf66',   // グリーン
                                4, '#ffd43b',   // イエロー
                                5, '#a15dd3',   // パープル
                                6, '#ff922b',   // オレンジ
                                '#e0e0e0'       // デフォルト
                            ],
                            '#e0e0e0'  // color_idがない場合はライトグレー
                        ]
                    ],
                    'fill-opacity': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false],
                        0.8,  // ホバー時は不透明度を上げる
                        0.6
                    ]
                }
            },
            {
                id: 'chou-fill-zoomed',
                type: 'fill',
                source: 'chou',
                minzoom: 15,
                paint: {
                    'fill-opacity': 0
                }
            },
            {
                id: 'chou-line',
                type: 'line',
                source: 'chou',
                minzoom: 12,
                paint: {
                    'line-color': '#333333',
                    'line-width': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        12, 1.5,
                        15, 2.5
                    ]
                }
            },
            {
                id: 'chou-label',
                type: 'symbol',
                source: 'chou',
                minzoom: 13,
                layout: {
                    'text-field': ['get', 'S_NAME'],
                    'text-font': ['Noto Sans Regular'],
                    'text-size': 14,
                    'text-anchor': 'center',
                    'text-allow-overlap': false,
                    'text-ignore-placement': false
                },
                paint: {
                    'text-color': '#000000',
                    'text-halo-color': '#ffffff',
                    'text-halo-width': 2
                }
            },
            {
                id: 'banchi-label',
                type: 'symbol',
                source: 'pmtiles',
                'source-layer': 'EPSG6668',
                minzoom: 18,
                layout: {
                    'text-field': ['get', '地番'],
                    'text-font': ['Noto Sans Regular'],
                    'text-size': 12,
                    'text-anchor': 'center',
                    'text-allow-overlap': false,
                    'text-ignore-placement': false
                },
                paint: {
                    'text-color': '#1a1a1a',
                    'text-halo-color': '#ffffff',
                    'text-halo-width': 1.5
                }
            }
        ]
    },
    center: [140.723877, 41.763117],
    zoom: 12,
    minZoom: 10,
    maxZoom: 19
});

// ナビゲーションコントロールを追加
map.addControl(new maplibregl.NavigationControl());

// 傾きリセットボタンの処理
document.getElementById('reset-pitch-button').addEventListener('click', () => {
    map.easeTo({
        pitch: 0,
        bearing: 0,
        duration: 500
    });
});

// ズームレベル表示を更新する関数
function updateZoomLevel() {
    const zoom = map.getZoom().toFixed(1);
    document.getElementById('zoom-level').textContent = `ズーム: ${zoom}`;
}

// 初期表示
map.on('load', () => {
    updateZoomLevel();
});

// ズーム変更時に更新
map.on('zoom', updateZoomLevel);

// ベースレイヤー切り替え機能
const baselayerRadios = document.querySelectorAll('input[name="baselayer"]');
baselayerRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        const selectedLayer = e.target.value;
        
        // すべてのベースレイヤーを非表示
        map.setLayoutProperty('osm', 'visibility', 'none');
        map.setLayoutProperty('gsi-std', 'visibility', 'none');
        map.setLayoutProperty('gsi-photo', 'visibility', 'none');
        
        // 選択されたレイヤーのみ表示
        map.setLayoutProperty(selectedLayer, 'visibility', 'visible');
    });
});

// ホバー状態を管理する変数
let hoveredFeatureId = null;
let hoveredChouId = null;

// ポップアップを作成
const popup = new maplibregl.Popup({
    closeButton: true,
    closeOnClick: false
});

map.on('load', () => {
    console.log('Map loaded');
    
    // PMTilesのレイヤーを確認
    map.on('sourcedata', (e) => {
        if (e.sourceId === 'pmtiles' && e.isSourceLoaded) {
            console.log('PMTiles source loaded');
            
            // データの範囲に合わせてズーム
            const bounds = map.getBounds();
            console.log('Current bounds:', bounds);
        }
    });

    // 地物をクリックしたときの処理
    map.on('click', 'pmtiles-fill', (e) => {
        if (e.features.length > 0) {
            const feature = e.features[0];
            const props = feature.properties;
            
            // プロパティ情報をHTMLに整形
            let html = '<div style="max-height: 300px; overflow-y: auto;">';
            html += '<h3 style="margin-top: 0;">地物情報</h3>';
            html += '<table style="width: 100%; border-collapse: collapse;">';
            
            // 主要な情報を先に表示
            const mainKeys = ['市区町村名', '大字名', '丁目名', '地番', '地図名'];
            mainKeys.forEach(key => {
                if (props[key]) {
                    html += `<tr style="border-bottom: 1px solid #ddd;">
                        <td style="padding: 4px; font-weight: bold;">${key}</td>
                        <td style="padding: 4px;">${props[key]}</td>
                    </tr>`;
                }
            });
            
            // その他の情報
            for (const [key, value] of Object.entries(props)) {
                if (!mainKeys.includes(key) && value) {
                    html += `<tr style="border-bottom: 1px solid #ddd;">
                        <td style="padding: 4px; font-weight: bold;">${key}</td>
                        <td style="padding: 4px;">${value}</td>
                    </tr>`;
                }
            }
            
            html += '</table></div>';
            
            // ポップアップを表示
            popup
                .setLngLat(e.lngLat)
                .setHTML(html)
                .addTo(map);
        }
    });

    // マウスカーソルを変更
    map.on('mouseenter', 'pmtiles-fill', () => {
        const zoom = map.getZoom();
        // ズームレベルが15以上の場合のみカーソルを変更
        if (zoom >= 15) {
            map.getCanvas().style.cursor = 'pointer';
        }
    });

    map.on('mouseleave', 'pmtiles-fill', () => {
        map.getCanvas().style.cursor = '';
    });

    // PMTilesレイヤーのホバーイベント
    let hoveredProperties = null;
    let hoverTimeout = null;
    const HOVER_DEBOUNCE_DELAY = 100; // マウス停止後のハイライト遅延（ミリ秒）
    
    map.on('mousemove', 'pmtiles-fill', (e) => {
        const zoom = map.getZoom();
        
        // ズームレベルが15以上の場合のみホバー処理
        if (zoom >= 15 && e.features.length > 0) {
            const feature = e.features[0];
            const props = feature.properties;
            
            // 一意な識別子を作成（複合キーを使用）
            // fidや筆IDは地図ごとに重複するため使用しない
            // 市区町村コード、大字コード、丁目コード、小字コード、地番、地図名の組み合わせで識別
            // 公共座標11系: 市区町村C を使用
            // 任意座標系: 市区町村コード を使用（市区町村Cがnullのため）
            const 市区町村識別子 = props['市区町村C'] || props['市区町村コード'];
            const 大字コード = props['大字コード'];
            const 丁目コード = props['丁目コード'];
            const 小字コード = props['小字コード'];
            const 地番 = props['地番'];
            const 地図名 = props['地図名'];
            
            // 必須プロパティの存在確認
            if (市区町村識別子 == null || 大字コード == null || 丁目コード == null || 
                小字コード == null || 地番 == null || 地図名 == null) {
                // プロパティが不足している場合はスキップ
                return;
            }
            
            // 複合キーで識別
            const uniqueKey = `${市区町村識別子}_${大字コード}_${丁目コード}_${小字コード}_${地番}_${地図名}`;
            
            // デバウンス処理: 既存のタイムアウトをクリア
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
            }
            
            // マウスが停止してから指定時間後にハイライトを更新
            hoverTimeout = setTimeout(() => {
                // 前回と異なるフィーチャーの場合のみ更新
                if (!hoveredProperties || hoveredProperties.uniqueKey !== uniqueKey) {
                    hoveredProperties = {
                        uniqueKey: uniqueKey,
                        市区町村識別子: 市区町村識別子,
                        大字コード: 大字コード,
                        丁目コード: 丁目コード,
                        小字コード: 小字コード,
                        地番: 地番,
                        地図名: 地図名
                    };
                    
                    // 複合キーを使用したフィルター条件を構築
                    // 市区町村識別子は市区町村Cまたは市区町村コードのいずれかにマッチ
                    const filterConditions = ['all',
                        ['any',
                            ['==', '市区町村C', 市区町村識別子],
                            ['==', '市区町村コード', 市区町村識別子]
                        ],
                        ['==', '大字コード', 大字コード],
                        ['==', '丁目コード', 丁目コード],
                        ['==', '小字コード', 小字コード],
                        ['==', '地番', 地番],
                        ['==', '地図名', 地図名]
                    ];
                    
                    map.setFilter('pmtiles-fill-hover', filterConditions);
                }
            }, HOVER_DEBOUNCE_DELAY);
        } else if (zoom < 15) {
            // ズームレベルが15未満になったらホバーレイヤーを非表示
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
                hoverTimeout = null;
            }
            map.setFilter('pmtiles-fill-hover', ['==', '市区町村C', '']);
            hoveredProperties = null;
        }
    });

    map.on('mouseleave', 'pmtiles-fill', () => {
        // タイムアウトをクリア
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            hoverTimeout = null;
        }
        // ホバーレイヤーを非表示
        map.setFilter('pmtiles-fill-hover', ['==', '市区町村C', '']);
        hoveredProperties = null;
    });

    // chouレイヤーのホバーイベント
    map.on('mouseenter', 'chou-fill', () => {
        const zoom = map.getZoom();
        // ズームレベルが15未満の場合のみカーソルを変更
        if (zoom < 15) {
            map.getCanvas().style.cursor = 'pointer';
        }
    });

    map.on('mousemove', 'chou-fill', (e) => {
        const zoom = map.getZoom();
        
        // ズームレベルが15未満の場合のみホバー処理
        if (zoom < 15 && e.features.length > 0) {
            const featureId = e.features[0].id;
            
            // IDが存在し、前回と異なる場合のみ処理
            if (featureId !== undefined && featureId !== hoveredChouId) {
                // 前のホバー状態をリセット
                if (hoveredChouId !== null) {
                    map.setFeatureState(
                        { source: 'chou', id: hoveredChouId },
                        { hover: false }
                    );
                }
                
                // 新しいフィーチャーにホバー状態を設定
                hoveredChouId = featureId;
                map.setFeatureState(
                    { source: 'chou', id: hoveredChouId },
                    { hover: true }
                );
            }
        } else if (zoom >= 15 && hoveredChouId !== null) {
            // ズームレベルが15以上になったら町のホバー状態をクリア
            map.setFeatureState(
                { source: 'chou', id: hoveredChouId },
                { hover: false }
            );
            hoveredChouId = null;
        }
    });

    map.on('mouseleave', 'chou-fill', () => {
        if (hoveredChouId !== null) {
            map.setFeatureState(
                { source: 'chou', id: hoveredChouId },
                { hover: false }
            );
        }
        hoveredChouId = null;
        map.getCanvas().style.cursor = '';
    });
});

// エラーハンドリング
map.on('error', (e) => {
    console.error('Map error:', e);
});
