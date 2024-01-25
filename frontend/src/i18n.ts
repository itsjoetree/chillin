import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

const translations = {
  en: {
    errors: {
      minLength: "{{field}} must be at least {{length}} characters",
      maxLength: "{{field}} must be at most {{length}} characters",
      required: "{{field}} is required",
      invalid: "{{field}} is invalid"
    },
    common: {
      username: "Username",
      password: "Password",
      email: "Email",
      nickname: "Nickname",
      birthday: "Birthday",
      login: "Login",
      logout: "Logout",
      continue: "Continue",
      confirm: "Confirm",
      submit: "Submit",
      cancel: "Cancel",
      back: "Back",
      delete: "Delete",
      remove: "Remove",
      getStarted: "Get Started",
      signIn: "Sign In",

      // Variants
      chillin: "Chillin'",
      charismatic: "Charasmatic",
      grounded: "Grounded",
      cool: "Cool",

      admin: "Admin",
      adminDescription: "Just vibin, represents a user with admin privileges"
    },
    profile: {
      follow: "Follow",
      followers: "Followers",
      following: "Following"
    },
    post: {
      newPlaceholder: "What's on your mind?",
      post: "Post",
      like: "Like",
      unlike: "Unlike",
      comments: "Comments",
      uploadedImage: "Uploaded image",
      selectedMedia: "Selected media",
      noComments: "No comments yet!",
      deleteTitle: "Delete post?",
      deleteDescription: "Are you sure you want to delete this post? This action cannot be undone.",
      deletedTitle: "Post deleted",
      deletedDescription: "Your post has been deleted"
    },
    onboarding: {
      welcomeTitle: "Welcome to <0>chillin!</0>",
      welcomeDescription: "A low key media site to connect with some some chill people developed by Joe Salinas",

      varaintSelectTitle: "What's your vibe?",
      variantSelectDescription: "Select a theme/accent that will be applied as you navigate the app.",

      chillinDescription: "You're chillin' like a villain",
      charismaticDescription: "You're charismatic like cupid",
      groundedDescription: "You're grounded like a tree",
      coolDescription: "You're cool as a cucumber",

      userInfoTitle: "User information",
      userInfoDescription: "Enter your user information to continue"
    }
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    defaultNS: "common",
    fallbackNS: "common",
    debug: true,
    resources: translations,
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;