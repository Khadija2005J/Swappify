<?php

namespace Database\Seeders;

use App\Models\SkillTemplate;
use Illuminate\Database\Seeder;

class SkillTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $skills = [
            // A
            ['name' => 'Adobe XD', 'category' => 'Design'],
            ['name' => 'Adobe Photoshop', 'category' => 'Design'],
            ['name' => 'Adobe Illustrator', 'category' => 'Design'],
            ['name' => 'After Effects', 'category' => 'Design'],
            ['name' => 'Android Development', 'category' => 'Mobile'],
            ['name' => 'Angular', 'category' => 'Frameworks'],
            ['name' => 'Ansible', 'category' => 'DevOps'],
            ['name' => 'API Development', 'category' => 'Web'],
            ['name' => 'Arduino', 'category' => 'IoT'],
            ['name' => 'AWS', 'category' => 'Cloud'],
            ['name' => 'Azure', 'category' => 'Cloud'],
            ['name' => 'Agile Methodology', 'category' => 'Management'],
            
            // B
            ['name' => 'Blockchain', 'category' => 'Technology'],
            ['name' => 'Bootstrap', 'category' => 'Frameworks'],
            ['name' => 'Bash Scripting', 'category' => 'DevOps'],
            ['name' => 'Blender', 'category' => '3D'],
            ['name' => 'Business Intelligence', 'category' => 'Data'],
            
            // C
            ['name' => 'C++', 'category' => 'Programmation'],
            ['name' => 'C#', 'category' => 'Programmation'],
            ['name' => 'C', 'category' => 'Programmation'],
            ['name' => 'CSS', 'category' => 'Web'],
            ['name' => 'Cybersecurity', 'category' => 'Sécurité'],
            ['name' => 'Cloud Computing', 'category' => 'Cloud'],
            ['name' => 'Cassandra', 'category' => 'Bases de données'],
            ['name' => 'CI/CD', 'category' => 'DevOps'],
            ['name' => 'Content Writing', 'category' => 'Marketing'],
            ['name' => 'Copywriting', 'category' => 'Marketing'],
            
            // D
            ['name' => 'Django', 'category' => 'Frameworks'],
            ['name' => 'Docker', 'category' => 'DevOps'],
            ['name' => 'Data Science', 'category' => 'Data'],
            ['name' => 'Data Analysis', 'category' => 'Data'],
            ['name' => 'Deep Learning', 'category' => 'AI'],
            ['name' => 'DevOps', 'category' => 'DevOps'],
            ['name' => 'Digital Marketing', 'category' => 'Marketing'],
            
            // E
            ['name' => 'Elasticsearch', 'category' => 'Bases de données'],
            ['name' => 'Electron', 'category' => 'Frameworks'],
            ['name' => 'Express.js', 'category' => 'Frameworks'],
            ['name' => 'Embedded Systems', 'category' => 'Hardware'],
            ['name' => 'Ethical Hacking', 'category' => 'Sécurité'],
            
            // F
            ['name' => 'Flask', 'category' => 'Frameworks'],
            ['name' => 'Flutter', 'category' => 'Mobile'],
            ['name' => 'Firebase', 'category' => 'Bases de données'],
            ['name' => 'Figma', 'category' => 'Design'],
            ['name' => 'FastAPI', 'category' => 'Frameworks'],
            
            // G
            ['name' => 'Git', 'category' => 'DevOps'],
            ['name' => 'GitHub', 'category' => 'DevOps'],
            ['name' => 'Go', 'category' => 'Programmation'],
            ['name' => 'Google Cloud Platform', 'category' => 'Cloud'],
            ['name' => 'GraphQL', 'category' => 'Web'],
            ['name' => 'Gatsby', 'category' => 'Frameworks'],
            
            // H
            ['name' => 'HTML', 'category' => 'Web'],
            ['name' => 'HTML/CSS', 'category' => 'Web'],
            ['name' => 'Haskell', 'category' => 'Programmation'],
            ['name' => 'Hadoop', 'category' => 'Data'],
            
            // I
            ['name' => 'iOS Development', 'category' => 'Mobile'],
            ['name' => 'Illustrator', 'category' => 'Design'],
            ['name' => 'InDesign', 'category' => 'Design'],
            ['name' => 'IoT', 'category' => 'Technology'],
            
            // J
            ['name' => 'Java', 'category' => 'Programmation'],
            ['name' => 'JavaScript', 'category' => 'Programmation'],
            ['name' => 'jQuery', 'category' => 'Frameworks'],
            ['name' => 'Jenkins', 'category' => 'DevOps'],
            ['name' => 'Jest', 'category' => 'Testing'],
            
            // K
            ['name' => 'Kotlin', 'category' => 'Programmation'],
            ['name' => 'Kubernetes', 'category' => 'DevOps'],
            ['name' => 'Kafka', 'category' => 'Data'],
            
            // L
            ['name' => 'Laravel', 'category' => 'Frameworks'],
            ['name' => 'Linux', 'category' => 'DevOps'],
            ['name' => 'Leadership', 'category' => 'Management'],
            
            // M
            ['name' => 'Machine Learning', 'category' => 'AI'],
            ['name' => 'MongoDB', 'category' => 'Bases de données'],
            ['name' => 'MySQL', 'category' => 'Bases de données'],
            ['name' => 'Microsoft Excel', 'category' => 'Office'],
            ['name' => 'Mobile Development', 'category' => 'Mobile'],
            
            // N
            ['name' => 'Node.js', 'category' => 'Frameworks'],
            ['name' => 'Next.js', 'category' => 'Frameworks'],
            ['name' => 'NestJS', 'category' => 'Frameworks'],
            ['name' => 'Natural Language Processing', 'category' => 'AI'],
            ['name' => 'Nuxt.js', 'category' => 'Frameworks'],
            
            // O
            ['name' => 'OAuth', 'category' => 'Sécurité'],
            ['name' => 'OpenCV', 'category' => 'AI'],
            ['name' => 'Oracle Database', 'category' => 'Bases de données'],
            
            // P
            ['name' => 'Python', 'category' => 'Programmation'],
            ['name' => 'PHP', 'category' => 'Programmation'],
            ['name' => 'PostgreSQL', 'category' => 'Bases de données'],
            ['name' => 'Photoshop', 'category' => 'Design'],
            ['name' => 'Power BI', 'category' => 'Data'],
            ['name' => 'Project Management', 'category' => 'Management'],
            
            // Q
            ['name' => 'Qt', 'category' => 'Frameworks'],
            ['name' => 'Quality Assurance', 'category' => 'Testing'],
            
            // R
            ['name' => 'React', 'category' => 'Frameworks'],
            ['name' => 'React Native', 'category' => 'Mobile'],
            ['name' => 'Ruby', 'category' => 'Programmation'],
            ['name' => 'Ruby on Rails', 'category' => 'Frameworks'],
            ['name' => 'Rust', 'category' => 'Programmation'],
            ['name' => 'Redis', 'category' => 'Bases de données'],
            ['name' => 'REST API', 'category' => 'Web'],
            ['name' => 'Responsive Design', 'category' => 'Web'],
            
            // S
            ['name' => 'Swift', 'category' => 'Programmation'],
            ['name' => 'Spring Boot', 'category' => 'Frameworks'],
            ['name' => 'SQL', 'category' => 'Bases de données'],
            ['name' => 'Svelte', 'category' => 'Frameworks'],
            ['name' => 'SEO', 'category' => 'Web'],
            ['name' => 'Salesforce', 'category' => 'CRM'],
            ['name' => 'Selenium', 'category' => 'Testing'],
            ['name' => 'Sketch', 'category' => 'Design'],
            
            // T
            ['name' => 'TypeScript', 'category' => 'Programmation'],
            ['name' => 'Tailwind CSS', 'category' => 'Frameworks'],
            ['name' => 'TensorFlow', 'category' => 'AI'],
            ['name' => 'Terraform', 'category' => 'DevOps'],
            ['name' => 'Three.js', 'category' => '3D'],
            
            // U
            ['name' => 'UI/UX Design', 'category' => 'Design'],
            ['name' => 'Unity', 'category' => 'Gaming'],
            ['name' => 'Unreal Engine', 'category' => 'Gaming'],
            ['name' => 'Ubuntu', 'category' => 'DevOps'],
            
            // V
            ['name' => 'Vue.js', 'category' => 'Frameworks'],
            ['name' => 'Version Control', 'category' => 'DevOps'],
            ['name' => 'Video Editing', 'category' => 'Media'],
            
            // W
            ['name' => 'Webpack', 'category' => 'DevOps'],
            ['name' => 'WordPress', 'category' => 'CMS'],
            ['name' => 'Web Development', 'category' => 'Web'],
            
            // X
            ['name' => 'XML', 'category' => 'Data'],
            ['name' => 'Xcode', 'category' => 'Mobile'],
            
            // Y
            ['name' => 'YAML', 'category' => 'DevOps'],
            
            // Z
            ['name' => 'Zoom API', 'category' => 'Web'],
        ];

        foreach ($skills as $skill) {
            SkillTemplate::firstOrCreate(['name' => $skill['name']], $skill);
        }
    }
}
