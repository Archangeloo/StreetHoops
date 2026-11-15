import test from 'node:test';
import assert from 'node:assert/strict';
import { cpfMask, phoneMask, dateMask } from '../src/services/masks.js';

test('máscara de CPF limita 11 dígitos e mantém a formatação', () => {
  assert.equal(cpfMask('52998224725'), '529.982.247-25');
  assert.equal(cpfMask('529.982.247-25'), '529.982.247-25');
  assert.equal(cpfMask('52998224725999'), '529.982.247-25');
});
test('máscara telefônica formata 10 ou 11 dígitos', () => {
  assert.equal(phoneMask('1133445566'), '(11) 3344-5566');
  assert.equal(phoneMask('11999991234'), '(11) 99999-1234');
});
test('máscara de nascimento aplica dd/mm/aaaa', () => {
  assert.equal(dateMask('30072000'), '30/07/2000');
  assert.equal(dateMask('30072000999'), '30/07/2000');
});
