export type Suggestion<OtherPropsType extends Record<string, any> = {}> = {
  id: string
  text: string
} & OtherPropsType

export type AddressComponents<OtherPropsType extends Record<string, any> = {}> =
  {
    address1: string
    address2: string
    city: string
    country: string
    id: string
    location: {
      latitude: number
      longitude: number
    }
    postalCode: string
    state: string
  } & OtherPropsType

export type Adapter<
  SuggestionOtherProps extends Record<string, any> = {},
  AddressComponentsOtherProps extends Record<string, any> = {},
> = {
  getAddressComponents: (
    suggestion: Suggestion<SuggestionOtherProps>
  ) => Promise<AddressComponents<AddressComponentsOtherProps>>
  getSuggestions: (query: string) => Promise<Suggestion<SuggestionOtherProps>[]>
  init: () => Promise<void>
} & Record<string, any>

export * from "./google"
export * from "./map-box"
