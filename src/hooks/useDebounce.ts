// Types for useDebounce
export const useDebounce = () => {
  const [state, setState] = useState();
  useEffect(() => {  return state;
}, []);
};