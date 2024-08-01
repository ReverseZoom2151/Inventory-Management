import { useState } from 'react';
import { storage, firestore } from './firebase'; // Firebase imports
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { Box, Button, Typography, LinearProgress, TextField } from '@mui/material';
import { PredictionServiceClient } from '@google-cloud/aiplatform';
import { Configuration, OpenAIApi } from 'openai';

// Vertex AI and OpenAI Setup
const client = new PredictionServiceClient({
  projectId: 'YOUR_PROJECT_ID',
  keyFilename: 'path/to/your/service-account-key.json',
});

const configuration = new Configuration({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

function Home() {
  // State declarations
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageURL, setImageURL] = useState('');
  const [classification, setClassification] = useState('');
  const [pantry, setPantry] = useState([]);
  const [recipe, setRecipe] = useState('');
  const [loading, setLoading] = useState(false);

  // Image upload handlers
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const uploadImage = () => {
    if (!selectedImage) return;

    const imageRef = ref(storage, `images/${uuidv4()}-${selectedImage.name}`);
    const uploadTask = uploadBytesResumable(imageRef, selectedImage);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error('Upload error:', error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          console.log('File available at', downloadURL);
          setImageURL(downloadURL);
        });
      }
    );
  };

  // Image classification handler
  const classifyImage = async (imageUri) => {
    try {
      const [response] = await client.predict({
        endpoint: `projects/YOUR_PROJECT_ID/locations/YOUR_LOCATION/endpoints/YOUR_ENDPOINT_ID`,
        instances: [{ content: imageUri }],
      });

      const predictions = response.predictions[0].displayNames;
      return predictions;
    } catch (error) {
      console.error('Error classifying image:', error);
      return null;
    }
  };

  const handleClassify = async () => {
    if (!imageURL) return;
    const result = await classifyImage(imageURL);
    setClassification(result ? result.join(', ') : 'No classification available');
  };

  // Recipe suggestion handler
  const suggestRecipes = async (pantryItems) => {
    const prompt = `Suggest a recipe using the following ingredients: ${pantryItems.join(', ')}`;

    try {
      const response = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt,
        max_tokens: 150,
      });

      const recipe = response.data.choices[0].text.trim();
      return recipe;
    } catch (error) {
      console.error('Error generating recipe:', error);
      return 'Unable to generate recipe.';
    }
  };

  const handleSuggestRecipe = async () => {
    setLoading(true);
    const result = await suggestRecipes(pantry.map((item) => item.name));
    setRecipe(result);
    setLoading(false);
  };

  return (
    <Box>
      {/* Image Upload */}
      <Typography variant="h4" gutterBottom>
        Upload an Image
      </Typography>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      <Button onClick={uploadImage} variant="contained" color="primary">
        Upload Image
      </Button>
      {uploadProgress > 0 && (
        <LinearProgress variant="determinate" value={uploadProgress} />
      )}
      {imageURL && (
        <Box mt={2}>
          <img src={imageURL} alt="Uploaded" width="100%" />
          <Typography variant="body2">Image URL: {imageURL}</Typography>
        </Box>
      )}

      {/* Image Classification */}
      <Typography variant="h4" gutterBottom>
        Classify an Image
      </Typography>
      <TextField
        label="Image URL"
        variant="outlined"
        fullWidth
        value={imageURL}
        onChange={(e) => setImageURL(e.target.value)}
      />
      <Button onClick={handleClassify} variant="contained" color="primary">
        Classify Image
      </Button>
      {classification && (
        <Typography variant="body1" mt={2}>
          Classification: {classification}
        </Typography>
      )}

      {/* Recipe Suggestion */}
      <Typography variant="h4" gutterBottom>
        Recipe Suggestions
      </Typography>
      <Button onClick={handleSuggestRecipe} variant="contained" color="primary">
        Suggest Recipe
      </Button>
      {loading ? (
        <Typography variant="body1" mt={2}>Loading...</Typography>
      ) : (
        <Typography variant="body1" mt={2}>{recipe}</Typography>
      )}
    </Box>
  );
}

export default Home;
