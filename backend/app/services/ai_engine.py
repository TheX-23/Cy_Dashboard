import logging
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
import joblib
from pathlib import Path
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class AIEngine:
    def __init__(self):
        self.model = IsolationForest(
            n_estimators=100,
            max_samples='auto',
            contamination=0.05, # Expecting 5% of traffic to be anomalous
            random_state=42
        )
        self.is_trained = False
        self.model_path = Path("./sentinelx_iforest_model.pkl")
        
        # Load model if exists
        self.load_model()

    def _extract_features(self, logs: List[Dict[str, Any]]) -> pd.DataFrame:
        """
        Extract numeric features from logs for the model.
        Features: request_size, response_size, status_code (as numeric), response_time
        """
        features = []
        for log in logs:
            # We assume logs have these fields or default them
            try:
                features.append({
                    "status_code": float(log.get("status_code", 200)),
                    "response_size": float(log.get("response_size", 0)),
                    "request_size": float(log.get("request_size", 0)),
                    "response_time": float(log.get("response_time_ms", 100))
                })
            except (ValueError, TypeError):
                continue
                
        return pd.DataFrame(features)

    def train(self, logs: List[Dict[str, Any]]):
        """
        Train the Isolation Forest model on historical log data.
        """
        df = self._extract_features(logs)
        if df.empty or len(df) < 50:
            logger.warning("Not enough valid logs to train the AI Engine (need at least 50).")
            return
            
        logger.info(f"Training Isolation Forest model with {len(df)} samples...")
        self.model.fit(df)
        self.is_trained = True
        
        # Save the model
        joblib.dump(self.model, self.model_path)
        logger.info("AI Engine training complete and model saved.")

    def load_model(self):
        """
        Load a pre-trained model from disk.
        """
        if self.model_path.exists():
            try:
                self.model = joblib.load(self.model_path)
                self.is_trained = True
                logger.info("Loaded pre-trained Isolation Forest model.")
            except Exception as e:
                logger.error(f"Failed to load AI model: {e}")

    def predict(self, log: Dict[str, Any]) -> bool:
        """
        Predict if a single log is anomalous.
        Returns True if anomalous, False otherwise.
        """
        if not self.is_trained:
            # If not trained, fallback to safe
            return False
            
        df = self._extract_features([log])
        if df.empty:
            return False
            
        # prediction is -1 for anomaly, 1 for normal
        prediction = self.model.predict(df)[0]
        is_anomaly = prediction == -1
        
        if is_anomaly:
            logger.warning(f"AI Engine detected anomaly in log from IP: {log.get('ip_address')}")
            
        return is_anomaly

ai_engine = AIEngine()
