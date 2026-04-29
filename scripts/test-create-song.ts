import { createItemAction } from '../lib/actions/item-actions';

async function test() {
  try {
    console.log('Attempting to create a song chart...');
    await createItemAction('song');
    console.log('Success!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

test();
