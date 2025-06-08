import { getAuth } from "firebase/auth";

export const postRequest = async (endpoint, data, onSuccess, onError) => {
    try {
        const user = getAuth().currentUser;
        if (!user) throw new Error("User not authenticated");
        console.log(endpoint);

        const idToken = await user.getIdToken();

        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${idToken}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`Request failed with status code ${response.status}`);
        }

        const result = await response.json();
        onSuccess(result);
    } catch (error) {
        onError(error);
    }
};

export default postRequest;
