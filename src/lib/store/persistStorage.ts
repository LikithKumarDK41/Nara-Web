import createWebStorage from "redux-persist/lib/storage/createWebStorage";

const createNoopStorage = () => ({
    getItem(_: string) {
        return Promise.resolve(null);
    },
    setItem(_: string, value: any) {
        return Promise.resolve(value);
    },
    removeItem(_: string) {
        return Promise.resolve();
    },
});

const storage =
    typeof window !== "undefined"
        ? createWebStorage("local")
        : createNoopStorage();

export default storage;
