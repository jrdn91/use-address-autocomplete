import React, { useEffect } from "react"
import { useDebouncedCallback } from "use-debounce"
import type { Adapter, AddressComponents, Suggestion } from "./adapters"

export interface UseAddressAutocompleteProps {
  debounceTime?: number
}

export default function useAddressAutocomplete<
  OtherSuggestProps extends Record<string, any>,
  OtherSelectedAddressProps extends Record<string, any>,
>(
  adapter: Adapter<OtherSuggestProps, OtherSelectedAddressProps>,
  { debounceTime = 1000 }: UseAddressAutocompleteProps = {}
) {
  const [value, setValue] = React.useState("")
  const [ready, setReady] = React.useState(false)
  const [loadingSuggestions, setLoadingSuggestions] = React.useState(false)
  const [selectedAddress, setSelectedAddress] =
    React.useState<AddressComponents<OtherSelectedAddressProps> | null>(null)
  const [suggestions, setSuggestions] = React.useState<
    Suggestion<OtherSuggestProps>[]
  >([])

  const getSuggestions = useDebouncedCallback((getSuggestionsValue) => {
    adapter
      .getSuggestions(getSuggestionsValue)
      .then((returnedSuggestions) => {
        setSuggestions(returnedSuggestions)
      })
      .finally(() => {
        setLoadingSuggestions(false)
      })
  }, debounceTime)

  useEffect(() => {
    async function doInit() {
      try {
        await adapter.init()
        setReady(true)
        return true
      } catch {
        return false
      }
    }
    doInit()
  }, [])

  return {
    value,
    setValue: (newValue: string) => {
      setLoadingSuggestions(true)
      setValue(newValue)
      getSuggestions(newValue)
    },
    ready,
    loadingSuggestions,
    suggestions,
    selectedAddress,
    selectSuggestion: (suggestion: Suggestion<OtherSuggestProps>) => {
      adapter
        .getAddressComponents(suggestion)
        .then((addressComponents) => {
          setSelectedAddress(addressComponents)
          setValue(suggestion.text)
          setSuggestions([])
        })
        .catch(console.error)
    },
  }
}
