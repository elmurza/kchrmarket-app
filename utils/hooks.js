import {useContext, useState} from "react";
import * as React from 'react';
import {useEffect, useRef} from "react";
import DataContext from "../data/DataContext";


export const REGEX = {
  EMAIL: /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i,
  PHONE: /\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g,
}

export const useForm = (
  {
    initialState = null,
    onCreate=()=>{},
    onUpdate=()=>{},
    requiredFieldNames=[]
  }
) => {
  const [state, setState] = useState(initialState)
  const [editMode, setEditMode] = useState(true)
  const [errors, setErrors] = useState([])


  /*
    useEffect(()=>{
      if (initialState !== null) {
        setState(initialState)
        setEditMode(false)
      } else {
        setEditMode(true)
      }
    }, [initialState])
  */

  const onInputChange = (fieldName, validationType) => (text) => {
    setState(prevState=>({...prevState, [fieldName]: text}))
    validate(fieldName, validationType, text)
  }

  const value = (fieldName) =>(state?.[fieldName]?.toString() || '')

  const onCancel = () => {
    setState(initialState)
    setEditMode(false)
  }

  const onSave = async () => {
    if (isSaveDisabled) return
    if (initialState === null)
      await onCreate(state)
    else
      await onUpdate(state)
    setEditMode(false)
  }

  const [saveWaiting, saveWithWaiting] = useWaiting(onSave)

  const isSaveDisabled = requiredFieldNames.reduce((result, fieldName)=>(!state?.[fieldName] || result), false) // || errors.length

  const validate = (fieldName, validationType, text) => {
    let regex
    switch (validationType) {
      case 'email': regex = REGEX.EMAIL; break
      case 'phone': regex = REGEX.PHONE; break
      default: return
    }
    const hasError = !regex.test(text)
    if (hasError)
      setErrors(errors=>[...errors, fieldName])
    else
      setErrors(errors=>errors.filter(error=>(fieldName !== error)))
  }
  const getInputProps = (fieldName, validationType=false) => ({
    onChange: onInputChange(fieldName, validationType),
    value: value(fieldName),
    isSaveDisabled,
    disabled: !editMode,
    onSubmit: saveWithWaiting,
    error: false, //errors.includes(fieldName),
    required: requiredFieldNames.includes(fieldName)
  })

  return {
    disabled: isSaveDisabled,
    editMode,
    _onInputChangeOf: onInputChange,
    _valueOf: value,
    save: saveWithWaiting,
    cancel: onCancel,
    isSaveWaiting: saveWaiting,
    edit: () => setEditMode(true),
    getInputProps
  }
}


export const useOfflineField = () => {
  const [state, setState] = useState(null)

  const get = () => {

    return state
  }


  return {data: state, set: setState, get}
}

export const useStateField = ({
                                getter = () => {}, creator = () => {},
                                updater = () => {}, deleter = () => {},
                                instant = false, _private=false,
                                assign=false,
                              }) => {
  const [data, setData] = useState({ data: null, isLoaded: false });

  const get = async (...args) => {
    const response = await getter(...args);
    setData({ data: response || null, isLoaded: true });
  };

  const load = async () => {
    if (!data.isLoaded) {
      await get();
    }
  };

  const create = async (...data) => {
    if (instant) {
      const response = await creator(...data)
      setData({ data: response || null, isLoaded: true });
      return
    }
    await creator(...data);
    await get();
  };

  const update = async (...data) => {
    if (instant) {
      const response = await updater(...data)
      if (!response) {
        const fallbackResponse = await get()
        setData({ data: fallbackResponse || null, isLoaded: true });
        return
      }
      setData({ data: response || null, isLoaded: true });
      return
    }

    await updater(...data);
    await get();
  };

  const remove = async (id) => {
    if (instant) {
      const response = await deleter(id)
      setData({ data: response || null, isLoaded: true });
      return
    }

    await deleter(id);
    await get();
  };

  const reset = () => {
    setData({data: null, isLoaded: false})
  }

  return { ...data, get, create, update, remove, load, reset, _private };
};


export const useWaiting = (func) => {
  const [waiting, setWaiting] = useState(false);

  const waitingFunc = async (...args) => {
    setWaiting(true);
    try {
      const result = await func(...args);
      setWaiting(false);
      return result;
    } catch (err) {
      setTimeout(()=> {
        setWaiting(false);
        // Alert.alert('Произошла ошибка', 'Повторите попытку позднее')
      }, 1000)
      return false;
    }

  };

  return [waiting, waitingFunc];
};

export function useCoolDown(callback = (...args) => {}, timeout=600, async=false) {

  const timer = useRef(null)

  const [pending, setPending] = useState(false)

  const modifiedCallback = (...args) => {
    if (timer.current)
      clearTimeout(timer.current)

    timer.current = setTimeout(async () => {
      setPending(true)
      const result =  await callback(...args)
      setPending(false)
      return result
    }, timeout)
  }

  return async ? [modifiedCallback, pending] : modifiedCallback
}

