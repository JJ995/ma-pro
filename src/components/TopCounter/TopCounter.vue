<template>
  <div>
    <h3>This the top counter component</h3>
    <p>This component contains the following nested sub-components:</p>
    <ul>
      <li>ExtendedCounter</li>
      <ul>
        <li>Counter</li>
        <ul>
          <li>ButtonDecrement</li>
          <ul>
            <li>CustomButton</li>
          </ul>
          <li>ButtonIncrement</li>
          <ul>
            <li>CustomButton</li>
          </ul>
        </ul>
      </ul>
    </ul>
    <ExtendedCounter />
  </div>
</template>

<script src="./TopCounter.mjs"></script>
