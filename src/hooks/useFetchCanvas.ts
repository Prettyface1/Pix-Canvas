// Types for useFetchCanvas
export const useFetchCanvas = () => {
  const [state, setState] = useState();
  useEffect(() => {  return state;
}, []);
};