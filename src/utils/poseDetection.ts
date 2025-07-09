import { Pose, Results } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';

export interface PoseViolation {
  type: string;
  severity: 'warning' | 'error';
  message: string;
  rule: string;
  angle?: number;
  threshold?: number;
}

export interface PoseKeypoints {
  nose: { x: number; y: number; z: number; visibility: number };
  leftShoulder: { x: number; y: number; z: number; visibility: number };
  rightShoulder: { x: number; y: number; z: number; visibility: number };
  leftElbow: { x: number; y: number; z: number; visibility: number };
  rightElbow: { x: number; y: number; z: number; visibility: number };
  leftWrist: { x: number; y: number; z: number; visibility: number };
  rightWrist: { x: number; y: number; z: number; visibility: number };
  leftHip: { x: number; y: number; z: number; visibility: number };
  rightHip: { x: number; y: number; z: number; visibility: number };
  leftKnee: { x: number; y: number; z: number; visibility: number };
  rightKnee: { x: number; y: number; z: number; visibility: number };
  leftAnkle: { x: number; y: number; z: number; visibility: number };
  rightAnkle: { x: number; y: number; z: number; visibility: number };
  leftEar: { x: number; y: number; z: number; visibility: number };
  rightEar: { x: number; y: number; z: number; visibility: number };
}

export class PoseAnalyzer {
  private pose: Pose;
  private camera: Camera | null = null;
  private onResults: (results: Results) => void;

  constructor(onResults: (results: Results) => void) {
    this.onResults = onResults;
    
    // Initialize MediaPipe Pose
    this.pose = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      }
    });

    // Configure pose detection settings
    this.pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    this.pose.onResults(this.onResults);
  }

  async startCamera(videoElement: HTMLVideoElement): Promise<void> {
    try {
      // Request camera permissions first
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      });
      
      videoElement.srcObject = stream;
      
      // Wait for video to be ready
      await new Promise((resolve) => {
        videoElement.onloadedmetadata = resolve;
      });

      // Initialize MediaPipe camera
      this.camera = new Camera(videoElement, {
        onFrame: async () => {
          if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
            await this.pose.send({ image: videoElement });
          }
        },
        width: 640,
        height: 480
      });
      
      await this.camera.start();
      console.log('Camera started successfully');
    } catch (error) {
      console.error('Error starting camera:', error);
      throw new Error(`Camera initialization failed: ${error.message}`);
    }
  }

  stopCamera(): void {
    if (this.camera) {
      this.camera.stop();
      this.camera = null;
    }
  }

  close(): void {
    this.stopCamera();
    if (this.pose) {
      this.pose.close();
    }
  }
}

export const extractKeypoints = (landmarks: any[]): PoseKeypoints | null => {
  if (!landmarks || landmarks.length < 33) return null;

  try {
    return {
      nose: landmarks[0],
      leftShoulder: landmarks[11],
      rightShoulder: landmarks[12],
      leftElbow: landmarks[13],
      rightElbow: landmarks[14],
      leftWrist: landmarks[15],
      rightWrist: landmarks[16],
      leftHip: landmarks[23],
      rightHip: landmarks[24],
      leftKnee: landmarks[25],
      rightKnee: landmarks[26],
      leftAnkle: landmarks[27],
      rightAnkle: landmarks[28],
      leftEar: landmarks[7],
      rightEar: landmarks[8]
    };
  } catch (error) {
    console.error('Error extracting keypoints:', error);
    return null;
  }
};

export const calculateAngle = (
  point1: { x: number; y: number },
  point2: { x: number; y: number },
  point3: { x: number; y: number }
): number => {
  try {
    const radians = Math.atan2(point3.y - point2.y, point3.x - point2.x) - 
                    Math.atan2(point1.y - point2.y, point1.x - point2.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    
    if (angle > 180.0) {
      angle = 360 - angle;
    }
    
    return angle;
  } catch (error) {
    console.error('Error calculating angle:', error);
    return 0;
  }
};

export const checkDeskPosture = (keypoints: PoseKeypoints): PoseViolation[] => {
  const violations: PoseViolation[] = [];

  try {
    // Check neck angle (forward head posture)
    if (keypoints.nose.visibility > 0.5 && 
        keypoints.leftShoulder.visibility > 0.5 && 
        keypoints.leftEar.visibility > 0.5) {
      
      const neckAngle = calculateAngle(
        keypoints.leftShoulder,
        keypoints.leftEar,
        keypoints.nose
      );

      if (neckAngle > 30) {
        violations.push({
          type: 'neck_angle',
          severity: neckAngle > 45 ? 'error' : 'warning',
          message: `Forward head posture detected`,
          rule: 'Keep your head aligned with your spine',
          angle: neckAngle,
          threshold: 30
        });
      }
    }

    // Check shoulder alignment (slouching)
    if (keypoints.leftShoulder.visibility > 0.5 && 
        keypoints.rightShoulder.visibility > 0.5 && 
        keypoints.leftHip.visibility > 0.5 && 
        keypoints.rightHip.visibility > 0.5) {
      
      const shoulderMidpoint = {
        x: (keypoints.leftShoulder.x + keypoints.rightShoulder.x) / 2,
        y: (keypoints.leftShoulder.y + keypoints.rightShoulder.y) / 2
      };
      
      const hipMidpoint = {
        x: (keypoints.leftHip.x + keypoints.rightHip.x) / 2,
        y: (keypoints.leftHip.y + keypoints.rightHip.y) / 2
      };

      const backAngle = Math.atan2(
        shoulderMidpoint.y - hipMidpoint.y,
        shoulderMidpoint.x - hipMidpoint.x
      ) * 180 / Math.PI;

      const slouchThreshold = 15;
      if (Math.abs(backAngle) > slouchThreshold) {
        violations.push({
          type: 'back_slouch',
          severity: Math.abs(backAngle) > 25 ? 'error' : 'warning',
          message: `Slouching detected`,
          rule: 'Keep your back straight and shoulders aligned',
          angle: Math.abs(backAngle),
          threshold: slouchThreshold
        });
      }
    }
  } catch (error) {
    console.error('Error checking desk posture:', error);
  }

  return violations;
};

export const checkSquatForm = (keypoints: PoseKeypoints): PoseViolation[] => {
  const violations: PoseViolation[] = [];

  try {
    // Check knee over toe (using left side)
    if (keypoints.leftKnee.visibility > 0.5 && keypoints.leftAnkle.visibility > 0.5) {
      const kneeOverToe = keypoints.leftKnee.x - keypoints.leftAnkle.x;
      
      if (Math.abs(kneeOverToe) > 0.05) {
        violations.push({
          type: 'knee_over_toe',
          severity: 'error',
          message: 'Knee tracking issue - adjust stance!',
          rule: 'Keep knees aligned with toes',
          angle: Math.abs(kneeOverToe) * 100,
          threshold: 5
        });
      }
    }

    // Check back angle during squat
    if (keypoints.leftShoulder.visibility > 0.5 && 
        keypoints.leftHip.visibility > 0.5 && 
        keypoints.leftKnee.visibility > 0.5) {
      
      const backAngle = calculateAngle(
        keypoints.leftKnee,
        keypoints.leftHip,
        keypoints.leftShoulder
      );

      if (backAngle < 150) {
        violations.push({
          type: 'back_angle',
          severity: backAngle < 130 ? 'error' : 'warning',
          message: `Keep chest up during squat!`,
          rule: 'Maintain upright torso during squat',
          angle: backAngle,
          threshold: 150
        });
      }
    }

    // Check squat depth
    if (keypoints.leftHip.visibility > 0.5 && keypoints.leftKnee.visibility > 0.5) {
      const hipKneeDistance = keypoints.leftHip.y - keypoints.leftKnee.y;
      
      if (hipKneeDistance > -0.02) {
        violations.push({
          type: 'squat_depth',
          severity: 'warning',
          message: 'Squat deeper for full range of motion',
          rule: 'Descend until hips are below knees',
          angle: hipKneeDistance * 100,
          threshold: -2
        });
      }
    }
  } catch (error) {
    console.error('Error checking squat form:', error);
  }

  return violations;
};