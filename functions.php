<?php
/**
 * Seaworth Theme Functions and Definitions
 *
 * @package Seaworth
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Updates from the public GitHub repository.
require_once get_template_directory() . '/inc/class-seaworth-updater.php';

/**
 * Sets up theme defaults and registers support for various WordPress features.
 */
function seaworth_theme_setup() {
    // Disable core WordPress bundled block patterns
    remove_theme_support( 'core-block-patterns' );

    // Add support for block styles
    add_theme_support( 'wp-block-styles' );

    // Enqueue editor styles (safely scoped to editor canvas only)
    add_theme_support( 'editor-styles' );
    add_editor_style( 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Montserrat:wght@200;300;400;500;600&family=Noto+Serif+TC:wght@200;300;400;600&display=swap' );
    add_editor_style( 'style.css' );
    add_editor_style( 'assets/css/main-static.css' );
    add_editor_style( 'assets/css/blocks.css' );

    // Add support for full and wide align images
    add_theme_support( 'align-wide' );

    // Add support for responsive embedded content
    add_theme_support( 'responsive-embeds' );

    // Refine Lab: content blocks. Zones are per-category content edited on the category screen; place them with the "Content" block.
    add_theme_support(
        'refinelab-content',
        array(
            'taxonomies' => array( 'category' ),
            'zones'      => array(
                'hero'   => array(
                    'label'   => 'Hero',
                    'default' => 'theme/hero',
                ),
            ),
        )
    );
}
add_action( 'after_setup_theme', 'seaworth_theme_setup' );

/**
 * Enqueue scripts and styles with high priority to preserve static HTML styling over WP core styles.
 */
function seaworth_enqueue_assets() {
    // 1. Google Fonts: Cormorant Garamond, Noto Serif TC, Montserrat
    wp_enqueue_style(
        'seaworth-fonts',
        'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Montserrat:wght@200;300;400;500;600&family=Noto+Serif+TC:wght@200;300;400;600&display=swap',
        array(),
        null
    );

    // 2. Theme main stylesheet
    $theme_css_path = get_stylesheet_directory() . '/style.css';
    $theme_css_ver  = file_exists( $theme_css_path ) ? filemtime( $theme_css_path ) : wp_get_theme()->get( 'Version' );
    wp_enqueue_style(
        'seaworth-style',
        get_stylesheet_uri(),
        array( 'seaworth-fonts' ),
        $theme_css_ver
    );

    // 3. Exact Static HTML Stylesheet (High priority over WP block library)
    $static_css_path = get_template_directory() . '/assets/css/main-static.css';
    $static_css_ver  = file_exists( $static_css_path ) ? filemtime( $static_css_path ) : wp_get_theme()->get( 'Version' );
    wp_enqueue_style(
        'seaworth-static-css',
        get_template_directory_uri() . '/assets/css/main-static.css',
        array( 'seaworth-style' ),
        $static_css_ver
    );

    // 4. Libraries: SimplexNoise & Lucide Icons
    wp_enqueue_script(
        'simplex-noise',
        get_template_directory_uri() . '/assets/js/simplex-noise.min.js',
        array(),
        '2.4.0',
        true
    );

    wp_enqueue_script(
        'lucide-icons',
        get_template_directory_uri() . '/assets/js/lucide.min.js',
        array(),
        'latest',
        true
    );

    // 5. Complete Frontend Animation & Interactive Suite from static HTML
    $theme_main_path = get_template_directory() . '/assets/js/theme-main.js';
    $theme_main_ver  = file_exists( $theme_main_path ) ? filemtime( $theme_main_path ) : wp_get_theme()->get( 'Version' );
    wp_enqueue_script(
        'seaworth-theme-main',
        get_template_directory_uri() . '/assets/js/theme-main.js',
        array( 'simplex-noise', 'lucide-icons' ),
        $theme_main_ver,
        true
    );

    // Localize theme and assets directory URIs for dynamic scripts
    wp_localize_script(
        'seaworth-theme-main',
        'seaworthThemeData',
        array(
            'themeUrl'  => get_template_directory_uri(),
            'assetsUrl' => get_template_directory_uri() . '/assets',
        )
    );
}
// High priority (99) to ensure static CSS is loaded after WordPress block-library styles
add_action( 'wp_enqueue_scripts', 'seaworth_enqueue_assets', 99 );

/**
 * Enqueue Google Fonts and interactive background canvas scripts in the Block Editor.
 *
 * Theme content styles are loaded via add_editor_style() to prevent them
 * from leaking into the WordPress block editor UI chrome.
 */
function seaworth_editor_assets() {
    wp_enqueue_style(
        'seaworth-editor-fonts',
        'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Montserrat:wght@200;300;400;500;600&family=Noto+Serif+TC:wght@200;300;400;600&display=swap',
        array(),
        null
    );

    wp_enqueue_script(
        'simplex-noise',
        get_template_directory_uri() . '/assets/js/simplex-noise.min.js',
        array(),
        '2.4.0',
        true
    );

    wp_enqueue_script(
        'lucide-icons',
        get_template_directory_uri() . '/assets/js/lucide.min.js',
        array(),
        'latest',
        true
    );

    wp_enqueue_script(
        'seaworth-editor-effects',
        get_template_directory_uri() . '/assets/js/theme-editor.js',
        array( 'simplex-noise', 'lucide-icons' ),
        filemtime( get_template_directory() . '/assets/js/theme-editor.js' ),
        true
    );
}
add_action( 'enqueue_block_editor_assets', 'seaworth_editor_assets' );

/**
 * Render the site preloader markup on frontend only.
 *
 * Ensures the preloader is strictly excluded from WP Admin, block editor screens,
 * REST API requests, JSON requests, and editor canvas rendering.
 */
function seaworth_render_preloader() {
    static $rendered = false;
    if ( $rendered ) {
        return;
    }

    // Strictly frontend only: skip admin, REST API, JSON, or edit canvas
    if ( is_admin() ) {
        return;
    }

    if ( function_exists( 'wp_is_json_request' ) && wp_is_json_request() ) {
        return;
    }

    if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) {
        return;
    }

    if ( isset( $_GET['canvas'] ) && 'edit' === $_GET['canvas'] ) {
        return;
    }

    if ( function_exists( 'get_current_screen' ) ) {
        $screen = get_current_screen();
        if ( $screen && $screen->is_block_editor() ) {
            return;
        }
    }

    $rendered = true;
    $logo_url = get_template_directory_uri() . '/assets/logo-icon.png';
    ?>
    <!-- 全站 Loading 效果：極簡置中 logomark + 呼吸細線，載入完成淡出 (Frontend only) -->
    <div class="site-loader" id="siteLoader" aria-hidden="true">
        <img src="<?php echo esc_url( $logo_url ); ?>" alt="" class="site-loader-mark" width="40" height="40" />
        <div class="site-loader-line"></div>
        <span class="site-loader-text">LOADING</span>
    </div>
    <?php
}
add_action( 'wp_body_open', 'seaworth_render_preloader', 1 );
add_action( 'wp_footer', 'seaworth_render_preloader', 999 );

/**
 * Disable remote block patterns from WordPress.org Directory in Block Inserter.
 */
add_filter( 'should_load_remote_block_patterns', '__return_false' );

/**
 * Register theme pattern categories and unregister unnecessary default core categories.
 */
function seaworth_register_pattern_categories() {
    register_block_pattern_category(
        'pages',
        array(
            'label'       => __( 'Seaworth Pages', 'seaworth' ),
            'description' => __( 'Full page templates and layouts for Seaworth Holding.', 'seaworth' ),
        )
    );

    register_block_pattern_category(
        'seaworth-pages',
        array(
            'label'       => __( 'Seaworth Page Layouts', 'seaworth' ),
            'description' => __( 'Pre-designed pages and sections for Seaworth theme.', 'seaworth' ),
        )
    );
}
add_action( 'init', 'seaworth_register_pattern_categories', 9 );

/**
 * Register custom block styles matching article style specifications (.style-spec-box).
 */
function seaworth_register_article_block_styles() {
    // 1. Photo Quote (Quote with background photo & gradient overlay)
    register_block_style(
        'core/quote',
        array(
            'name'  => 'photo-quote',
            'label' => __( 'Photo Quote (背景圖引言)', 'seaworth' ),
        )
    );

    register_block_style(
        'core/cover',
        array(
            'name'  => 'photo-quote',
            'label' => __( 'Photo Quote (引言樣式)', 'seaworth' ),
        )
    );

    // 2. Paragraph Signature (簽名檔)
    register_block_style(
        'core/paragraph',
        array(
            'name'  => 'signature',
            'label' => __( 'Signature (簽名檔)', 'seaworth' ),
        )
    );

    // 3. Paragraph Source Attribution (來源出處)
    register_block_style(
        'core/paragraph',
        array(
            'name'  => 'source',
            'label' => __( 'Source Attribution (來源出處)', 'seaworth' ),
        )
    );
}
add_action( 'init', 'seaworth_register_article_block_styles' );


