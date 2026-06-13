import React, { useState } from 'react';
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { BORDER_RADIUS, COLORS } from '../constants/colors';
import { COMMUNITY_POSTS } from '../constants/mockData';

type RootTabParamList = {
  Community: undefined;
};

type CommunityScreenProps = BottomTabScreenProps<RootTabParamList, 'Community'>;

interface Comment {
  id: string;
  author: string;
  avatar: string;
  time: string;
  content: string;
}

export const CommunityScreen: React.FC<CommunityScreenProps> = () => {
  const insets = useSafeAreaInsets();
  const [posts, setPosts] = useState(COMMUNITY_POSTS);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  
  // Track comments list per post ID
  const [commentsByPost, setCommentsByPost] = useState<Record<string, Comment[]>>({
    '1': [
      { id: '1-1', author: 'Rahul Sharma', avatar: '👨', time: '1h ago', content: 'Yes, Pandit Rajesh is indeed very accurate!' },
      { id: '1-2', author: 'Karan Johar', avatar: '🧑', time: '30m ago', content: 'I am planning to book a session soon too.' }
    ],
    '2': [
      { id: '2-1', author: 'Sneha Patel', avatar: '👩', time: '3h ago', content: 'Vedic astrology courses are top-tier here.' }
    ],
    '3': [
      { id: '3-1', author: 'Amit Khan', avatar: '👨', time: '5h ago', content: 'Which prayers do you follow daily?' }
    ]
  });

  const [newPostText, setNewPostText] = useState('');
  const [selectedPostForComments, setSelectedPostForComments] = useState<any | null>(null);
  const [newCommentText, setNewCommentText] = useState('');

  // Post Submission
  const handleCreatePost = () => {
    if (newPostText.trim().length === 0) return;
    
    const newPost = {
      id: String(Date.now()),
      author: 'You',
      avatar: '👤',
      time: 'Just now',
      content: newPostText,
      likes: 0,
      comments: 0,
    };
    
    setPosts([newPost, ...posts]);
    setNewPostText('');
  };

  // Like Logic
  const handleLike = (postId: string) => {
    const isAlreadyLiked = likedPosts[postId];
    
    setLikedPosts(prev => ({
      ...prev,
      [postId]: !isAlreadyLiked
    }));
    
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: isAlreadyLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  // Share Logic
  const handleShare = async (content: string) => {
    try {
      await Share.share({
        message: content,
      });
    } catch (error) {
      console.log('Error sharing post:', error);
    }
  };

  // Add Comment Logic
  const handleAddComment = () => {
    if (!selectedPostForComments || newCommentText.trim().length === 0) return;
    
    const postId = selectedPostForComments.id;
    const newComment: Comment = {
      id: `${postId}-${Date.now()}`,
      author: 'You',
      avatar: '👤',
      time: 'Just now',
      content: newCommentText,
    };
    
    setCommentsByPost(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment]
    }));
    
    // Update posts comment count
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: post.comments + 1
        };
      }
      return post;
    }));
    
    // Keep modal state updated
    setSelectedPostForComments((prev: any) => {
      if (!prev) return null;
      return {
        ...prev,
        comments: prev.comments + 1
      };
    });
    
    setNewCommentText('');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <LinearGradient 
        colors={COLORS.gradient} 
        style={[styles.header, { paddingTop: insets.top > 0 ? insets.top + 12 : 24 }]}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Community Feed</Text>
        </View>
      </LinearGradient>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.createPostCard}>
            <View style={styles.createPostHeader}>
              <View style={styles.createPostAvatar}>
                <Text style={styles.createPostAvatarText}>👤</Text>
              </View>
              <Text style={styles.createPostTitle}>Share Your Experience</Text>
            </View>
            <TextInput
              style={styles.createPostInput}
              placeholder="How was your spiritual consultation or reading? Share a review..."
              placeholderTextColor={COLORS.textHint}
              value={newPostText}
              onChangeText={setNewPostText}
              multiline
              numberOfLines={3}
            />
            <TouchableOpacity
              style={[
                styles.submitPostButton,
                newPostText.trim().length === 0 && styles.submitPostButtonDisabled,
              ]}
              onPress={handleCreatePost}
              disabled={newPostText.trim().length === 0}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={newPostText.trim().length === 0 ? ['#E0E0E0', '#D6D6D6'] : COLORS.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitPostButtonGradient}
              >
                <Text style={styles.submitPostButtonText}>Post Review</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={styles.authorAvatar}>
                <Text style={styles.authorAvatarText}>{item.avatar}</Text>
              </View>
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>{item.author}</Text>
                <Text style={styles.postTime}>{item.time}</Text>
              </View>
            </View>

            <Text style={styles.postContent}>{item.content}</Text>

            <View style={styles.postFooter}>
              <TouchableOpacity 
                style={styles.footerItem} 
                onPress={() => handleLike(item.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.footerIcon}>
                  {likedPosts[item.id] ? '❤️' : '👍'}
                </Text>
                <Text style={[styles.footerText, likedPosts[item.id] && { color: COLORS.error, fontWeight: '700' }]}>
                  {item.likes} {likedPosts[item.id] ? 'Liked' : 'Likes'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.footerItem} 
                onPress={() => setSelectedPostForComments(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.footerIcon}>💬</Text>
                <Text style={styles.footerText}>{item.comments} Comments</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.footerItem} 
                onPress={() => handleShare(item.content)}
                activeOpacity={0.7}
              >
                <Text style={styles.footerIcon}>↗️</Text>
                <Text style={styles.footerText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>👥</Text>
            <Text style={styles.emptyStateText}>No posts yet</Text>
          </View>
        }
      />

      {/* Interactive Comments Modal */}
      <Modal
        visible={selectedPostForComments !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedPostForComments(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reviews & Comments</Text>
              <TouchableOpacity
                onPress={() => setSelectedPostForComments(null)}
                style={styles.closeModalButton}
                activeOpacity={0.7}
              >
                <Feather name="x" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Post Preview inside Modal */}
            {selectedPostForComments ? (
              <View style={styles.postPreview}>
                <View style={styles.previewAuthorRow}>
                  <Text style={styles.previewAvatar}>{selectedPostForComments.avatar}</Text>
                  <Text style={styles.previewAuthor}>{selectedPostForComments.author}</Text>
                </View>
                <Text style={styles.previewText}>{selectedPostForComments.content}</Text>
              </View>
            ) : null}

            {/* Comments List */}
            <FlatList
              data={selectedPostForComments ? (commentsByPost[selectedPostForComments.id] || []) : []}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.commentItem}>
                  <View style={styles.commentAvatar}>
                    <Text style={styles.commentAvatarText}>{item.avatar}</Text>
                  </View>
                  <View style={styles.commentBody}>
                    <View style={styles.commentAuthorRow}>
                      <Text style={styles.commentAuthor}>{item.author}</Text>
                      <Text style={styles.commentTime}>{item.time}</Text>
                    </View>
                    <Text style={styles.commentText}>{item.content}</Text>
                  </View>
                </View>
              )}
              contentContainerStyle={styles.commentsListContent}
              ListEmptyComponent={
                <View style={styles.emptyComments}>
                  <Text style={styles.emptyCommentsIcon}>💬</Text>
                  <Text style={styles.emptyCommentsText}>No comments yet</Text>
                  <Text style={styles.emptyCommentsSubtext}>Add a comment to share your opinion!</Text>
                </View>
              }
            />

            {/* Comment Form Section */}
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Write a comment..."
                placeholderTextColor={COLORS.textHint}
                value={newCommentText}
                onChangeText={setNewCommentText}
                multiline
              />
              <TouchableOpacity
                style={[
                  styles.sendCommentButton,
                  newCommentText.trim().length === 0 && styles.sendCommentButtonDisabled,
                ]}
                onPress={handleAddComment}
                disabled={newCommentText.trim().length === 0}
                activeOpacity={0.7}
              >
                <Feather name="send" size={18} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  listContent: {
    padding: 16,
    paddingBottom: 120, // Clean overlap padding for floating navigation tab
  },
  createPostCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.card,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  createPostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  createPostAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.lightBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createPostAvatarText: {
    fontSize: 16,
  },
  createPostTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  createPostInput: {
    backgroundColor: COLORS.lightGray,
    borderRadius: BORDER_RADIUS.card - 4,
    padding: 12,
    height: 80,
    fontSize: 13,
    color: COLORS.textPrimary,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  submitPostButton: {
    borderRadius: BORDER_RADIUS.button,
    overflow: 'hidden',
    height: 40,
  },
  submitPostButtonDisabled: {
    opacity: 0.7,
  },
  submitPostButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitPostButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  postCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.card,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0D6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorAvatarText: {
    fontSize: 18,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  postTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  postContent: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.borderLight,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  footerIcon: {
    fontSize: 14,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '75%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  closeModalButton: {
    padding: 4,
  },
  postPreview: {
    backgroundColor: COLORS.lightGray,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: BORDER_RADIUS.card - 4,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  previewAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  previewAvatar: {
    fontSize: 14,
  },
  previewAuthor: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  previewText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  commentsListContent: {
    padding: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 10,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF0D6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentAvatarText: {
    fontSize: 14,
  },
  commentBody: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 10,
  },
  commentAuthorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  commentTime: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  commentText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
  emptyComments: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyCommentsIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyCommentsText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  emptyCommentsSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    backgroundColor: COLORS.white,
    gap: 10,
  },
  commentInput: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  sendCommentButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendCommentButtonDisabled: {
    backgroundColor: COLORS.textHint,
  },
});

