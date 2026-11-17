<?php
/**
 * Theme updates from the public GitHub repository (hoquangthaiholy/seaworth-theme).
 *
 * The release workflow publishes a zip and commits update.json (version, package address, SHA-256) to the repository.
 * WordPress asks this class on its normal update check (Dashboard → Updates, Appearance → Themes, auto-updates):
 * when update.json names a newer version it is offered like any other theme update. The package is only installed
 * when it is a release asset of that repository and its SHA-256 matches update.json.
 *
 * @package Seaworth
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * GitHub-based theme updater.
 */
class Seaworth_Updater {

	const SLUG      = 'seaworth';
	const REPO      = 'hoquangthaiholy/seaworth-theme';
	const MANIFEST  = 'https://raw.githubusercontent.com/hoquangthaiholy/seaworth-theme/main/update.json';
	const CACHE_KEY = 'seaworth_update_manifest';
	const CACHE_OK  = 12 * HOUR_IN_SECONDS;
	const CACHE_BAD = HOUR_IN_SECONDS;

	/**
	 * Hook in.
	 */
	public static function init() {
		add_filter( 'pre_set_site_transient_update_themes', array( __CLASS__, 'filter_update_transient' ) );
		add_filter( 'upgrader_pre_download', array( __CLASS__, 'verify_package' ), 10, 4 );
		add_action( 'upgrader_process_complete', array( __CLASS__, 'clear_cache' ) );
	}

	/**
	 * Manifest address (override with SEAWORTH_UPDATE_URL or the seaworth_update_manifest_url filter for testing).
	 *
	 * @return string
	 */
	private static function manifest_url() {
		$url = defined( 'SEAWORTH_UPDATE_URL' ) ? (string) SEAWORTH_UPDATE_URL : self::MANIFEST;
		return (string) apply_filters( 'seaworth_update_manifest_url', $url );
	}

	/**
	 * Whether a URL is a release asset of the theme repository (HTTPS, github.com, no query).
	 *
	 * @param string $url URL.
	 * @return bool
	 */
	private static function is_package_url( $url ) {
		$parts = wp_parse_url( (string) $url );
		return ! empty( $parts['scheme'] ) && 'https' === $parts['scheme']
			&& ! empty( $parts['host'] ) && 'github.com' === strtolower( $parts['host'] )
			&& ! empty( $parts['path'] ) && 0 === strpos( $parts['path'], '/' . self::REPO . '/releases/download/' )
			&& empty( $parts['query'] );
	}

	/**
	 * Latest release information, cached. Failures are cached briefly as array( 'error' => message ).
	 *
	 * @param bool $force Ignore the cache.
	 * @return array
	 */
	public static function get_manifest( $force = false ) {
		if ( ! $force ) {
			$cached = get_transient( self::CACHE_KEY );
			if ( is_array( $cached ) ) {
				return $cached;
			}
		}
		$manifest = self::fetch_manifest();
		set_transient( self::CACHE_KEY, $manifest, isset( $manifest['error'] ) ? self::CACHE_BAD : self::CACHE_OK );
		return $manifest;
	}

	/**
	 * Download and validate update.json.
	 *
	 * @return array Validated manifest or array( 'error' => message ).
	 */
	private static function fetch_manifest() {
		$response = wp_safe_remote_get(
			self::manifest_url(),
			array(
				'timeout'     => 8,
				'redirection' => 0,
				'headers'     => array( 'Accept' => 'application/json' ),
				'user-agent'  => 'Seaworth-theme/' . wp_get_theme( self::SLUG )->get( 'Version' ) . '; ' . home_url(),
			)
		);
		if ( is_wp_error( $response ) ) {
			return array( 'error' => $response->get_error_message() );
		}
		if ( 200 !== (int) wp_remote_retrieve_response_code( $response ) ) {
			return array( 'error' => 'HTTP ' . (int) wp_remote_retrieve_response_code( $response ) );
		}
		$data = json_decode( wp_remote_retrieve_body( $response ), true );
		if ( ! is_array( $data ) || empty( $data['version'] ) || ! preg_match( '/^\d+(\.\d+){1,3}([-+.][0-9A-Za-z.-]+)?$/', (string) $data['version'] ) ) {
			return array( 'error' => 'Invalid update information.' );
		}
		$out = array(
			'version'      => (string) $data['version'],
			'package'      => '',
			'sha256'       => '',
			'requires'     => isset( $data['requires'] ) ? sanitize_text_field( (string) $data['requires'] ) : '',
			'requires_php' => isset( $data['requires_php'] ) ? sanitize_text_field( (string) $data['requires_php'] ) : '',
		);
		if ( ! empty( $data['package'] ) && is_string( $data['package'] ) && self::is_package_url( $data['package'] ) ) {
			$out['package'] = esc_url_raw( $data['package'], array( 'https' ) );
		}
		if ( ! empty( $data['sha256'] ) && preg_match( '/^[a-f0-9]{64}$/i', (string) $data['sha256'] ) ) {
			$out['sha256'] = strtolower( (string) $data['sha256'] );
		}
		if ( '' === $out['sha256'] ) {
			$out['package'] = ''; // A package without a checksum is never offered.
		}
		return $out;
	}

	/**
	 * Add the update to WordPress' theme update data when a newer version exists.
	 *
	 * @param object $transient update_themes transient.
	 * @return object
	 */
	public static function filter_update_transient( $transient ) {
		if ( ! is_object( $transient ) ) {
			return $transient;
		}
		$manifest  = self::get_manifest();
		$installed = wp_get_theme( self::SLUG )->get( 'Version' );
		if ( isset( $manifest['error'] ) || empty( $manifest['package'] ) || ! $installed ) {
			return $transient;
		}
		$entry = array(
			'theme'        => self::SLUG,
			'new_version'  => $manifest['version'],
			'url'          => 'https://github.com/' . self::REPO . '/releases/tag/v' . $manifest['version'],
			'package'      => $manifest['package'],
			'requires'     => $manifest['requires'],
			'requires_php' => $manifest['requires_php'],
		);
		if ( version_compare( $manifest['version'], $installed, '>' ) ) {
			$transient->response[ self::SLUG ] = $entry;
			unset( $transient->no_update[ self::SLUG ] );
		} else {
			$transient->no_update[ self::SLUG ] = $entry;
			unset( $transient->response[ self::SLUG ] );
		}
		return $transient;
	}

	/**
	 * Install only the package named in update.json, and only if its SHA-256 matches.
	 *
	 * @param bool|string|WP_Error $reply      Existing reply.
	 * @param string               $package    Package URL.
	 * @param WP_Upgrader          $upgrader   Upgrader.
	 * @param array                $hook_extra Extra data.
	 * @return bool|string|WP_Error
	 */
	public static function verify_package( $reply, $package, $upgrader, $hook_extra = array() ) {
		if ( empty( $hook_extra['theme'] ) || self::SLUG !== $hook_extra['theme'] ) {
			return $reply;
		}
		$manifest = self::get_manifest();
		if ( empty( $manifest['package'] ) || empty( $manifest['sha256'] ) || $manifest['package'] !== $package || ! self::is_package_url( $package ) ) {
			return new WP_Error( 'seaworth_package', __( 'The theme update could not be verified, so it was not installed.', 'seaworth' ) );
		}
		if ( ! function_exists( 'download_url' ) ) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
		}
		$file = download_url( $package, 300 );
		if ( is_wp_error( $file ) ) {
			return $file;
		}
		if ( ! hash_equals( $manifest['sha256'], (string) hash_file( 'sha256', $file ) ) ) {
			wp_delete_file( $file );
			return new WP_Error( 'seaworth_checksum', __( 'The downloaded theme update does not match its checksum, so it was not installed.', 'seaworth' ) );
		}
		return $file;
	}

	/**
	 * Forget the cached manifest after an update ran.
	 *
	 * @return void
	 */
	public static function clear_cache() {
		delete_transient( self::CACHE_KEY );
	}
}

Seaworth_Updater::init();
