# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.



Logo -- it's off center
Authentication --- who knows It's looking goooodddd
Ads -- TestIds are in place

Recipe Data. 
Ingredient data -- ONecart functionality Tumi's API?

Sort & Filter


Virtual lists for performance

My Pantry 
SELECT
  r.id AS recipe_id,
  r.name AS recipe_name,
  COALESCE(SUM(i.cost), 0) AS missing_ingredient_cost
FROM
  RecipeTable r
LEFT JOIN IngredientTable i ON i.recipe_id = r.id
LEFT JOIN PantryTable p
  ON p.ingredient_id = i.id AND p.user_id = :user_id
WHERE
  p.id IS NULL
GROUP BY
  r.id, r.name
ORDER BY
  r.id
LIMIT :limit OFFSET :offset;


getRecipes -> for each Recipe, sum the cost of the ingredients are that aren't in Pantry
https://www.youtube.com/watch?v=PdwYDatvJ2I

implement refresh tokens