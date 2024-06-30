import type { Adapter } from "."

const placeTypes = [
  "street_number",
  "route",
  "intersection",
  "political",
  "country",
  "administrative_area_level_1",
  "administrative_area_level_2",
  "administrative_area_level_3",
  "administrative_area_level_4",
  "administrative_area_level_5",
  "administrative_area_level_6",
  "administrative_area_level_7",
  "colloquial_area",
  "locality",
  "sublocality",
  "neighborhood",
  "premise",
  "subpremise",
  "plus_code",
  "postal_code",
  "natural_feature",
  "airport",
  "park",
  "point_of_interest",
] as const

type PlaceType = (typeof placeTypes)[number]

type PlacesAddressComponent = {
  longText: string | null
  shortText: string | null
  types: PlaceType[]
}

type AddressComponentsByType = Record<PlaceType, string>

export type GoogleSuggestRequestOptions = {
  includedRegionCodes?: string[]
  languageCode?: string
  origin?: {
    latitude: number
    longitude: number
  }
  regionCode?: string
} & (
  | {
      locationBias?: Record<string, any>
      locationRestriction?: never
    }
  | {
      locationBias?: never
      locationRestriction?: Record<string, any>
    }
)

export type PlaceDetailsRequestOptions = {
  languageCode?: string
  regionCode?: string
}

export const createGooglePlacesAdapter = (
  apiKey: string,
  options?: {
    placeDetailsRequestOptions?: PlaceDetailsRequestOptions
    suggestRequestOptions?: GoogleSuggestRequestOptions
  }
): Adapter => ({
  init() {
    if (!apiKey) {
      return Promise.reject(console.error("Google API key is required"))
    }
    const currentSessionToken =
      window.sessionStorage.getItem("googleSessionToken")
    if (currentSessionToken) {
      return Promise.resolve()
    }
    const newSessionToken = window.crypto.randomUUID()
    window.sessionStorage.setItem("googleSessionToken", newSessionToken)
    return Promise.resolve()
  },
  getSuggestions(query) {
    const sessionToken = window.sessionStorage.getItem("googleSessionToken")
    return fetch(
      `https://places.googleapis.com/v1/places:autocomplete?key=${apiKey}`,
      {
        method: "POST",
        body: JSON.stringify({
          ...options?.suggestRequestOptions,
          input: query,
          sessionToken,
        }),
      }
    )
      .then(
        (response) =>
          response.json() as Promise<{ suggestions: Record<string, any>[] }>
      )
      .then(({ suggestions }) =>
        suggestions.map((suggestion) => ({
          id: suggestion.placePrediction.placeId,
          text: suggestion.placePrediction.text.text,
        }))
      )
  },
  getAddressComponents(suggestion) {
    const sessionToken = window.sessionStorage.getItem(
      "googleSessionToken"
    ) as string
    const searchParams = new URLSearchParams({
      ...options?.placeDetailsRequestOptions,
      fields: "id,addressComponents,location",
      key: apiKey,
      sessionToken,
    })
    return fetch(
      `https://places.googleapis.com/v1/places/${suggestion.id}?${searchParams.toString()}`
    )
      .then(
        (response) =>
          response.json() as Promise<{
            addressComponents: PlacesAddressComponent[]
            id: string
            location: {
              latitude: number
              longitude: number
            }
          }>
      )
      .then((response) => {
        const addressComponentsByType = response.addressComponents.reduce(
          (obj, component) => {
            const updates = {} as AddressComponentsByType
            component.types.forEach((type) => {
              updates[type] = component.shortText || component.longText || ""
            })
            return { ...obj, ...updates }
          },
          {} as AddressComponentsByType
        )

        return {
          address1: `${addressComponentsByType.street_number} ${addressComponentsByType.route}`,
          address2: "",
          city: addressComponentsByType.locality,
          state: addressComponentsByType.administrative_area_level_1,
          postalCode: addressComponentsByType.postal_code,
          country: addressComponentsByType.country,
          id: response.id,
          location: response.location,
        }
      })
  },
})
