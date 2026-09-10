/**
 * Central FDOT / Florida 511 configuration.
 *
 * All integration details for the official FDOT camera data live here so the
 * API layer can be updated without touching application code.
 *
 * No keys are required — these are public ArcGIS feature services published
 * by FDOT / the Florida 511 program.
 */
export const FDOT = {
  /** ArcGIS REST service containing the live FL511 traffic cameras. */
  serviceUrl:
    'https://services.arcgis.com/3wFbqsFPLeKqOlIK/arcgis/rest/services/FL511_Traffic_Cameras/FeatureServer/0/query',
  /** Safe page size when paginating the feature service. */
  pageSize: 2000,
  /** How often (ms) the catalog is re-validated in the background. */
  catalogRefreshMs: 5 * 60 * 1000,
  /** How often (ms) an open full-screen camera feed is refreshed. */
  feedRefreshMs: 15 * 1000,
  /** How often (ms) thumbnails for visible cameras are re-requested. */
  visibleRefreshMs: 45 * 1000,
  /**
   * County-level scope used for the "Jacksonville area" list view. District
   * Two of FDOT covers Duval, Clay, St. Johns and Nassau counties.
   */
  jaxAreaCounties: ['Duval', 'Clay', 'St. Johns', 'Nassau'],
  /** Rough bounding box of the Jacksonville metro area for the default view. */
  bounds: {
    south: 30.85,
    west: -81.5,
    north: 30.46,
    east: -81.3,
  },
}