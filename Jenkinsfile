pipeline {
    agent any 

    environment {
        OSS_BUCKET = 'oss://voidx-ai-add-on' 
        CDN_DOMAIN = 'https://addon-cdn.voidx.ai'
        ALIYUN_CREDS_ID = 'aliyun-oss-creds'
    }

    stages {
        stage('Upload to OSS') {
            steps {
                script {
                    def bucketName = env.OSS_BUCKET.replace('oss://', '')
                    
                    withCredentials([usernamePassword(credentialsId: env.ALIYUN_CREDS_ID, 
                                                     usernameVariable: 'ALIYUN_KEY_ID', 
                                                     passwordVariable: 'ALIYUN_KEY_SECRET')]) {
                        
                        dir('dist') {
                            echo "Uploading 'voidx-ai-addon.es.js' to OSS bucket: ${bucketName}"
                            
                            sh 'ls -l' 

                            aliyunOSSUpload(
                                accessKeyId: env.ALIYUN_KEY_ID,
                                accessKeySecret: env.ALIYUN_KEY_SECRET,
                                endpoint: "oss-ap-northeast-2.aliyuncs.com",
                                bucketName: bucketName,
                                localPath: ' voidx-ai-addon.es.js', 
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