'use client';

import { Box, Stack, Typography, Button, Modal, TextField, InputAdornment, Paper, Divider } from '@mui/material'; // Correct imports
import SearchIcon from '@mui/icons-material/Search'; // Import SearchIcon correctly
import { firestore } from './firebase';
import { collection, getDocs, query, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
  gap: 3,
};

export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [itemName, setItemName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const updatePantry = async () => {
    const snapshot = await getDocs(query(collection(firestore, 'pantry')));
    const pantryList = [];
    snapshot.forEach((doc) => {
      pantryList.push({name: doc.id, ...doc.data()});
    });
    setPantry(pantryList);
  }

  useEffect(() => {
    updatePantry();
  }, []);

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const {count} = docSnap.data();
      setDoc(docRef, {count: count + 1});
    } else {
      setDoc(docRef, {count: 1})
    }
    updatePantry();
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const {count} = docSnap.data();
      if (count === 1) {
        deleteDoc(docRef);
      } else {
        setDoc(docRef, {count: count - 1})
      }
    }
    updatePantry();
  }

  const filteredPantry = pantry.filter(({ name }) =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box
      width="100vw"
      minHeight="100vh"
      display="flex"
      justifyContent="center"
      flexDirection="column"
      alignItems="center"
      gap={2}
      bgcolor="#f7f9fc"
    >
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box 
          sx={style}
        >
          <Typography 
            id="modal-modal-title" 
            variant="h6" 
            component="h2"
            color="primary"
          >
            Add Item
          </Typography>
          <Stack 
            width="100%"
            direction={'row'} 
            spacing={2}
          >
            <TextField 
              id="outlined-basic" 
              label="Item" 
              variant="outlined" 
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button 
              variant="contained"
              onClick = {() => {
                addItem(itemName)
                setItemName('')
                handleClose()
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Button 
        variant="contained" 
        onClick={handleOpen}
        sx={{ marginTop: 2 }}
      >
        Add Item
      </Button>
      <TextField
        label="Search Items"
        variant="outlined"
        fullWidth
        margin="normal"
        sx={{ maxWidth: '800px' }}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment 
              position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      <Paper
        elevation={3}
        sx=
        {{ 
          maxWidth: '800px', 
          width: '100%', 
          overflow: 'hidden', 
          borderRadius: 2 
        }}
      >
        <Box 
          height="100px" 
          bgcolor="#1565C0" 
          display="flex" 
          justifyContent="center" 
          alignItems="center"
        >
          <Typography 
            variant="h4" 
            color="white" 
            textAlign="center"
          >
            Pantry Items
          </Typography>
        </Box>
        <Stack 
          spacing={2} 
          sx=
          {{ 
            maxHeight: '400px', 
            overflowY: 'auto', 
            p: 2 
          }}
        >
          {filteredPantry.map(({name, count}) => (
            <Paper
              key={name}
              sx=
              {{ 
                padding: 2, 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}
              elevation={2}
            >
              <Typography
                variant="h5"
                color="textPrimary"
                textAlign="center"
              >
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Divider 
                orientation="vertical" 
                flexItem sx={{ mx: 2 }} 
              />
              <Typography 
                variant="h6" 
                color="textSecondary" 
                textAlign="center"
              >
                Quantity: {count}
              </Typography>
              <Button
                variant='outlined'
                color='secondary'
                onClick={() => removeItem(name)}
              >
                Remove
              </Button>
            </Paper>
          ))}
        </Stack>
      </Paper>
    </Box>
  )
}
