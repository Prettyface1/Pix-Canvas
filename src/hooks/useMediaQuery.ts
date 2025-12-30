/**
 * useMediaQuery hook description
 */
// Types for useMediaQuery
export const useMediaQuery = () => {
  const [state, setState] = useState();
  useEffect(() => {  return state;
}, []);
};