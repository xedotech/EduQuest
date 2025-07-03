from flask import Blueprint, request, jsonify
from functools import wraps
from src.config.firebase_config import verify_firebase_token, get_user_by_uid

auth_bp = Blueprint('auth', __name__)

def require_auth(f):
    """Decorator to require Firebase authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({'error': 'No authorization header'}), 401
        
        try:
            # Extract token from "Bearer <token>"
            token = auth_header.split(' ')[1]
            decoded_token = verify_firebase_token(token)
            
            if not decoded_token:
                return jsonify({'error': 'Invalid token'}), 401
            
            # Add user info to request context
            request.user = decoded_token
            return f(*args, **kwargs)
            
        except Exception as e:
            return jsonify({'error': 'Token verification failed'}), 401
    
    return decorated_function

@auth_bp.route('/verify-token', methods=['POST'])
def verify_token():
    """Verify Firebase ID token"""
    try:
        data = request.get_json()
        id_token = data.get('idToken')
        
        if not id_token:
            return jsonify({'error': 'No token provided'}), 400
        
        decoded_token = verify_firebase_token(id_token)
        
        if decoded_token:
            # Get additional user info
            user_info = get_user_by_uid(decoded_token['uid'])
            
            return jsonify({
                'success': True,
                'user': {
                    'uid': decoded_token['uid'],
                    'email': decoded_token.get('email'),
                    'email_verified': decoded_token.get('email_verified', False),
                    'display_name': user_info.get('display_name') if user_info else None,
                    'photo_url': user_info.get('photo_url') if user_info else None
                }
            })
        else:
            return jsonify({'error': 'Invalid token'}), 401
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/user-info', methods=['GET'])
@require_auth
def get_user_info():
    """Get current user information"""
    try:
        user_uid = request.user['uid']
        user_info = get_user_by_uid(user_uid)
        
        if user_info:
            return jsonify({
                'success': True,
                'user': user_info
            })
        else:
            return jsonify({'error': 'User not found'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/refresh-token', methods=['POST'])
@require_auth
def refresh_token():
    """Refresh user token (placeholder for future implementation)"""
    try:
        return jsonify({
            'success': True,
            'message': 'Token is valid',
            'user': {
                'uid': request.user['uid'],
                'email': request.user.get('email')
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

