export const BAD_WORDS = [
    "admin", "yonetici", "moderator", "destek", "support", "kiyasgo",
    "amk", "aq", "pic", "yarak", "yarrak", "sik", "siktir", "got", "göt", "orosbu", "orospu", "kahpe", "kaltak", "yavsak", "yavşak", "ibne", "gavat", "pezevenk", "bok", "sokuk", "salak", "gerizekali", "mall", "denyo"
];

export const containsBadWord = (text) => {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    return BAD_WORDS.some(word => lowerText.includes(word));
};
