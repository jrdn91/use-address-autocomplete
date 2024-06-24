import { v4 as uuidv4 } from "uuid"
import type { Adapter } from "."

export interface MapBoxSuggestResponse {
  attribution: string
  response_id: string
  suggestions: Suggestion[]
}

export interface Suggestion {
  address: string
  context: Context
  feature_type: string
  full_address: string
  language: string
  maki: string
  mapbox_id: string
  metadata: Metadata
  name: string
  place_formatted: string
}

export interface Context {
  address: Address
  country: Country
  district?: District
  locality?: District
  neighborhood?: District
  place: District
  postcode: District
  region: Region
  street: District
}

export interface Address {
  address_number: string
  id: string
  name: string
  street_name: string
}

export interface Country {
  country_code: string
  country_code_alpha_3: string
  id: string
  name: string
}

export interface District {
  id?: string
  name: string
}

export interface Region {
  id: string
  name: string
  region_code: string
  region_code_full: string
}

export interface MapBoxRetrievePlaceResponse {
  attribution: string
  features: Feature[]
  type: string
}

export interface Feature {
  geometry: Geometry
  properties: Properties
  type: string
}

export interface Geometry {
  coordinates: number[]
  type: string
}

export interface Properties {
  address: string
  context: Context
  coordinates: Coordinates
  feature_type: string
  full_address: string
  language: string
  maki: string
  mapbox_id: string
  metadata: Metadata
  name: string
  name_preferred: string
  place_formatted: string
}

export interface Coordinates {
  accuracy: string
  latitude: number
  longitude: number
  routable_points: RoutablePoint[]
}

export interface RoutablePoint {
  latitude: number
  longitude: number
  name: string
}

export interface Metadata {}

export type MapBoxSuggestRequestOptions = {
  bbox?: string
  country?: string
  eta_type?: "navigation"
  language?: string
  limit?: string
  navigation_profile?: "driving" | "walking" | "cycling"
  origin?: string
  poi_category?: string
  poi_category_exclusions?: string
  proximity?: string
  route?: string
  route_geometry?: "polyline" | "polyline6"
  time_deviation?: string
  types?: string
}

export type RetrieveRequestOptions = {
  attribute_sets?: string
  language?: string
}

export const createMapBoxAdapter = (
  accessToken: string,
  options?: {
    retrieveRequestOptions?: RetrieveRequestOptions
    suggestRequestOptions?: MapBoxSuggestRequestOptions
  }
): Adapter => ({
  init() {
    if (!accessToken) {
      return Promise.reject(console.error("MapBox API key is required"))
    }
    const newSessionToken = uuidv4()
    this.sessionToken = newSessionToken
    window.sessionStorage.setItem("mapboxSessionToken", newSessionToken)
    return Promise.resolve()
  },
  getSuggestions(query) {
    const searchParams = new URLSearchParams({
      ...options?.suggestRequestOptions,
      q: query,
      access_token: accessToken,
      session_token: this.sessionToken,
    })
    return fetch(
      `https://api.mapbox.com/search/searchbox/v1/suggest?${searchParams.toString()}`
    )
      .then((res) => res.json() as Promise<MapBoxSuggestResponse>)
      .then((res) =>
        res.suggestions.map((suggestion) => ({
          id: suggestion.mapbox_id,
          text: suggestion.full_address,
        }))
      )
  },
  getAddressComponents(suggestion) {
    const searcParams = new URLSearchParams({
      ...options?.retrieveRequestOptions,
      access_token: accessToken,
      session_token: this.sessionToken,
    })
    return fetch(
      `https://api.mapbox.com/search/searchbox/v1/retrieve/${suggestion.id}?${searcParams.toString()}`
    )
      .then((res) => res.json() as Promise<MapBoxRetrievePlaceResponse>)
      .then((res) => {
        const addressFeature = res.features[0]
        return {
          address1: addressFeature.properties.context.address.name,
          address2: "",
          city: addressFeature.properties.context.place.name,
          country: addressFeature.properties.context.country.name,
          postalCode: addressFeature.properties.context.postcode.name,
          state: addressFeature.properties.context.region.region_code,
          id: suggestion.id,
          location: {
            latitude: addressFeature.geometry.coordinates[1],
            longitude: addressFeature.geometry.coordinates[0],
          },
        }
      })
  },
})
