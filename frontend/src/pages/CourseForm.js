import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  X, 
  Upload, 
  AlertCircle,
  BookOpen,
  Target,
  Award
} from 'lucide-react';
import { coursesAPI, skillsAPI } from '../services/api';

const CourseForm = () => {
  const { id } = useParams(); // If id exists, we're editing
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  
  const isEditing = Boolean(id);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty_level: 'beginner',
    duration_hours: '',
    instructor_name: '',
    instructor_bio: '',
    course_image: '',
    video_url: '',
    prerequisites: '',
    price: '',
    learning_objectives: [''],
    course_materials: [''],
    skills: [] // Array of { skill_id, skill_level }
  });

  const [availableSkills, setAvailableSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // Check permissions
  useEffect(() => {
    if (!user || !['admin', 'manager'].includes(user.role)) {
      navigate('/courses');
      return;
    }
  }, [user, navigate]);

  // Load initial data
  useEffect(() => {
    loadSkills();
    loadCategories();
    if (isEditing) {
      loadCourse();
    }
  }, [id, isEditing]);

  const loadSkills = async () => {
    try {
      const response = await skillsAPI.getAll();
      if (response.data.success) {
        setAvailableSkills(response.data.data);
      }
    } catch (err) {
      console.error('Load skills error:', err);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await coursesAPI.getCategories();
      if (response.data.success) {
        setCategories(response.data.data.map(cat => cat.category));
      }
    } catch (err) {
      console.error('Load categories error:', err);
    }
  };

  const loadCourse = async () => {
    try {
      const response = await coursesAPI.getById(id);
      if (response.data.success) {
        const course = response.data.data;
        // Map course skills to form format
        const courseSkills = (course.Skills && Array.isArray(course.Skills)) ? course.Skills.map(skill => ({
          skill_id: skill.id,
          skill_level: skill.CourseSkill?.skill_level || 1
        })) : [];
        setFormData({
          title: course.title || '',
          description: course.description || '',
          category: course.category || '',
          difficulty_level: course.difficulty_level || 'beginner',
          duration_hours: course.duration_hours || '',
          instructor_name: course.instructor_name || '',
          instructor_bio: course.instructor_bio || '',
          course_image: course.course_image || '',
          video_url: course.video_url || '',
          prerequisites: course.prerequisites || '',
          price: course.price || '',
          learning_objectives: Array.isArray(course.learning_objectives) && course.learning_objectives.length > 0 ? course.learning_objectives : [''],
          course_materials: Array.isArray(course.course_materials) && course.course_materials.length > 0 ? course.course_materials : [''],
          skills: courseSkills
        });
      }
    } catch (err) {
      setError('Failed to load course for editing');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleArrayFieldChange = (fieldName, index, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayField = (fieldName) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: [...prev[fieldName], '']
    }));
  };

  const removeArrayField = (fieldName, index) => {
    if (formData[fieldName].length > 1) {
      setFormData(prev => ({
        ...prev,
        [fieldName]: prev[fieldName].filter((_, i) => i !== index)
      }));
    }
  };

  const handleSkillChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) => 
        i === index ? { ...skill, [field]: value } : skill
      )
    }));
  };

  const addSkill = () => {
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, { skill_id: '', skill_level: 1 }]
    }));
  };

  const removeSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const errors = {};

    // Required fields
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }

    if (!formData.category.trim()) {
      errors.category = 'Category is required';
    }

    // Numeric validations
    if (formData.duration_hours && (isNaN(formData.duration_hours) || formData.duration_hours < 0 || formData.duration_hours > 1000)) {
      errors.duration_hours = 'Duration must be a number between 0 and 1000';
    }

    if (formData.price && (isNaN(formData.price) || formData.price < 0 || formData.price > 10000)) {
      errors.price = 'Price must be a number between 0 and 10000';
    }

    // URL validations
    if (formData.course_image && !isValidUrl(formData.course_image)) {
      errors.course_image = 'Please enter a valid URL';
    }

    if (formData.video_url && !isValidUrl(formData.video_url)) {
      errors.video_url = 'Please enter a valid URL';
    }

    // Skills validation
    const invalidSkills = formData.skills.filter(skill => 
      !skill.skill_id || skill.skill_level < 1 || skill.skill_level > 5
    );
    if (invalidSkills.length > 0) {
      errors.skills = 'All skills must be selected with a valid level (1-5)';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Clean up form data
      const submitData = {
        ...formData,
        duration_hours: formData.duration_hours ? Number(formData.duration_hours) : null,
        price: formData.price ? Number(formData.price) : 0,
        learning_objectives: formData.learning_objectives.filter(obj => obj.trim()),
        course_materials: formData.course_materials.filter(mat => mat.trim()),
        skills: formData.skills.filter(skill => skill.skill_id)
      };

      let response;
      if (isEditing) {
        response = await coursesAPI.update(id, submitData);
      } else {
        response = await coursesAPI.create(submitData);
      }

      if (response.data.success) {
        navigate(`/courses/${response.data.data.id}`);
      }
    } catch (err) {
      console.error('Submit course error:', err);
      setError(err.response?.data?.error?.message || `Failed to ${isEditing ? 'update' : 'create'} course`);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          to={isEditing ? `/courses/${id}` : '/courses'}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to {isEditing ? 'Course' : 'Courses'}
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? 'Edit Course' : 'Create New Course'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isEditing ? 'Update course information and settings' : 'Fill out the details to create a new course'}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-600">{error}</span>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-primary-600" />
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  fieldErrors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter a clear, descriptive title"
              />
              {fieldErrors.title && (
                <p className="text-red-600 text-sm mt-1">{fieldErrors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  fieldErrors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Describe what students will learn in this course"
              />
              {fieldErrors.description && (
                <p className="text-red-600 text-sm mt-1">{fieldErrors.description}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                list="categories"
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  fieldErrors.category ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Programming, Design, Marketing"
              />
              <datalist id="categories">
                {categories.map((category, idx) => (
                  <option key={category + '-' + idx} value={category} />
                ))}
              </datalist>
              {fieldErrors.category && (
                <p className="text-red-600 text-sm mt-1">{fieldErrors.category}</p>
              )}
            </div>

            {/* Difficulty Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                name="difficulty_level"
                value={formData.difficulty_level}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (hours)
              </label>
              <input
                type="number"
                name="duration_hours"
                value={formData.duration_hours}
                onChange={handleInputChange}
                min="0"
                max="1000"
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  fieldErrors.duration_hours ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {fieldErrors.duration_hours && (
                <p className="text-red-600 text-sm mt-1">{fieldErrors.duration_hours}</p>
              )}
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price ($)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                max="10000"
                step="0.01"
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  fieldErrors.price ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {fieldErrors.price && (
                <p className="text-red-600 text-sm mt-1">{fieldErrors.price}</p>
              )}
            </div>
          </div>
        </div>

        {/* Instructor Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Instructor Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Instructor Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructor Name
              </label>
              <input
                type="text"
                name="instructor_name"
                value={formData.instructor_name}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter instructor name"
              />
            </div>

            {/* Instructor Bio */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructor Bio
              </label>
              <textarea
                name="instructor_bio"
                value={formData.instructor_bio}
                onChange={handleInputChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Brief description of the instructor's background and expertise"
              />
            </div>
          </div>
        </div>

        {/* Media & Resources */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Media & Resources</h2>
          
          <div className="space-y-6">
            {/* Course Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Image URL
              </label>
              <input
                type="url"
                name="course_image"
                value={formData.course_image}
                onChange={handleInputChange}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  fieldErrors.course_image ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="https://example.com/image.jpg"
              />
              {fieldErrors.course_image && (
                <p className="text-red-600 text-sm mt-1">{fieldErrors.course_image}</p>
              )}
            </div>

            {/* Video URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview Video URL
              </label>
              <input
                type="url"
                name="video_url"
                value={formData.video_url}
                onChange={handleInputChange}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  fieldErrors.video_url ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="https://youtube.com/watch?v=..."
              />
              {fieldErrors.video_url && (
                <p className="text-red-600 text-sm mt-1">{fieldErrors.video_url}</p>
              )}
            </div>

            {/* Course Materials */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Materials
              </label>
              {formData.course_materials.map((material, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => handleArrayFieldChange('course_materials', index, e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., PDF Guide, Video Lectures, Code Examples"
                  />
                  {formData.course_materials.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayField('course_materials', index)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayField('course_materials')}
                className="flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Material
              </button>
            </div>
          </div>
        </div>

        {/* Learning Objectives */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Target className="w-5 h-5 mr-2 text-primary-600" />
            Learning Objectives
          </h2>
          
          {formData.learning_objectives.map((objective, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={objective}
                onChange={(e) => handleArrayFieldChange('learning_objectives', index, e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="What will students be able to do after completing this course?"
              />
              {formData.learning_objectives.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayField('learning_objectives', index)}
                  className="p-2 text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayField('learning_objectives')}
            className="flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Objective
          </button>
        </div>

        {/* Prerequisites & Skills */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Award className="w-5 h-5 mr-2 text-primary-600" />
            Prerequisites & Skills
          </h2>
          
          <div className="space-y-6">
            {/* Prerequisites */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prerequisites
              </label>
              <textarea
                name="prerequisites"
                value={formData.prerequisites}
                onChange={handleInputChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="What knowledge or skills should students have before taking this course?"
              />
            </div>

            {/* Skills Taught */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills Taught in This Course
              </label>
              {formData.skills.map((skill, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <select
                    value={skill.skill_id}
                    onChange={(e) => handleSkillChange(index, 'skill_id', e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select a skill</option>
                    {availableSkills.map(availableSkill => (
                      <option key={availableSkill.id} value={availableSkill.id}>
                        {availableSkill.name} ({availableSkill.category})
                      </option>
                    ))}
                  </select>
                  <select
                    value={skill.skill_level}
                    onChange={(e) => handleSkillChange(index, 'skill_level', Number(e.target.value))}
                    className="w-32 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value={1}>Level 1</option>
                    <option value={2}>Level 2</option>
                    <option value={3}>Level 3</option>
                    <option value={4}>Level 4</option>
                    <option value={5}>Level 5</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addSkill}
                className="flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Skill
              </button>
              {fieldErrors.skills && (
                <p className="text-red-600 text-sm mt-1">{fieldErrors.skills}</p>
              )}
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-6">
          <Link
            to={isEditing ? `/courses/${id}` : '/courses'}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? 'Update Course' : 'Create Course'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;