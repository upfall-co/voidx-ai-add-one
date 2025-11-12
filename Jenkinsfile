pipeline {
    agent any 

    environment {
        OSS_BUCKET = 'oss://voidx-ai-add-on' 
        CDN_DOMAIN = 'https://addon-cdn.voidx.ai'
        ALIYUN_CREDS_ID = 'aliyun-oss-creds'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/upfall-co/voidx-ai-add-on.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Upload to OSS') {
            steps {
                script {
                    def bucketName = env.OSS_BUCKET.replace('oss://', '')
                    
                    withCredentials([usernamePassword(credentialsId: env.ALIYUN_CREDS_ID, 
                                                     usernameVariable: 'ALIYUN_KEY_ID', 
                                                     passwordVariable: 'ALIYUN_KEY_SECRET')]) {
                        
                        dir('dist') {
                            echo "Uploading ALL files from /dist to OSS bucket: ${bucketName}"

                            // [디버깅 추가] dist 폴더의 모든 파일 목록을 로그에 출력합니다.
                            echo "--- Files in dist directory ---"
                            sh 'ls -R'
                            echo "---------------------------------"

                            aliyunOSSUpload(
                                accessKeyId: env.ALIYUN_KEY_ID,
                                accessKeySecret: env.ALIYUN_KEY_SECRET,
                                endpoint: "oss-ap-northeast-2.aliyuncs.com",
                                bucketName: bucketName,
                                
                                // [수정] localPath를 '**/*' (별표 두 개)로 변경
                                localPath: '**/*', 
                                
                                remotePath: '/'          
                            )
                        }
                    }
                }
            }
        }
    }
    
    post {
        always {
            deleteDir()
        }
    }
}