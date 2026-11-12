import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validatePlannerInput, conversationalReply} from '../server/planner.mjs';

const state={charter:{mode:'gentle',routine:'walking',fallbackMinutes:10}};
test('allows reasonable bounded local prompts',()=>{
  assert.equal(validatePlannerInput('I missed a walk',state,'llama3.2:latest'),true);
});
test('rejects oversized and empty user input',()=>{
  assert.equal(validatePlannerInput('a'.repeat(1201),state,'llama3.2'),false);
  assert.equal(validatePlannerInput(' ',state,'llama3.2'),false);
});
test('rejects suspicious model identifiers and malformed charter',()=>{
  assert.equal(validatePlannerInput('hello',state,'other;curl bad'),false);
  assert.equal(validatePlannerInput('hello',{charter:{...state.charter,routine:'a'.repeat(201)}},'llama'),false);
  assert.equal(validatePlannerInput('hello',{charter:{...state.charter,fallbackMinutes:-1}},'llama'),false);
});
test('does not call a model for invalid input',async()=>{
  const saved=process.env.OLLAMA_MODEL;
  process.env.OLLAMA_MODEL='llama3.2';
  try{assert.equal(await conversationalReply('a'.repeat(1201),state),null);}
  finally{if(saved===undefined)delete process.env.OLLAMA_MODEL;else process.env.OLLAMA_MODEL=saved;}
});
