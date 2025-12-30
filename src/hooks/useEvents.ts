// Types for useEvents
export const useEvents = () => {
  const [state, setState] = useState();
  useEffect(() => {  return state;
}, []);
};