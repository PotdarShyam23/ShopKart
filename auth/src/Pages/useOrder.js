import { useEffect, useState } from "react";
import api from "../Services/api.js";

export default function useOrder(id) {
  const [result, setResult] = useState({
    id: null,
    order: null,
    loading: true,
    error: "",
  });
  useEffect(() => {
    const controller = new AbortController();
    api
      .get("/orders/" + id, {
        signal: controller.signal,
      })
      .then((response) =>
        setResult({
          id,
          order: response.data.order,
          loading: false,
          error: "",
        }),
      )
      .catch((failure) => {
        if (!controller.signal.aborted) {
          setResult({
            id,
            order: null,
            loading: false,
            error:
              failure.response?.data?.message || "Unable to load your order.",
          });
        }
      });
    return () => controller.abort();
  }, [id]);
  if (result.id === id) {
    return result;
  } else {
    return {
      order: null,
      loading: true,
      error: "",
    };
  }
}
// Loads the selected order and exposes loading and error states.
