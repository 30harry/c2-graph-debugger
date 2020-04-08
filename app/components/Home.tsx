import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import styles from './Home.css';

export default function Home() {
  return (
    <div className={styles.container} data-tid="container">
      <h2>Home</h2>
      <h3><Link to={routes.TEXTVIEW}>to Text View</Link></h3>
      <h3><Link to={routes.GRAPHVIEW}>to Graph View</Link></h3>
    </div>
  );
}
