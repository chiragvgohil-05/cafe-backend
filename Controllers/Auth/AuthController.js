import bcrypt from 'bcrypt';
import jwt  from 'jsonwebtoken';
import user from "../../Models/UserModel.js";

const register = async (req, res) => {
    try {
    
      const { name, email, password, role } = req.body;
  
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }
  
      const exist = await user.findOne({ email });
  
      if (exist) {
        return res.status(409).json({
          success: false,
          message: "User already exists",
        });
      }
      const hashPassword = await bcrypt.hash(password, 10);
      const newUser = await user.create({
        name,
        email,
        password: hashPassword,
        role: role || "customer",
      });
  
      return res.status(201).json({
        success: true,
        message: "User registered successfully",
          data: newUser
      });
  
    } catch (error) {
      console.error("Register error:", error);
  
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  };

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            })
        }
       const existMatch = await user.findOne({email});
       if(!existMatch){
           return res.status(401).json({
               success: false,
               message: "Invalid credentials",
           })
       }
      const comparePassword = await bcrypt.compare(password, existMatch.password );
       if(!comparePassword){
           return res.status(401).json({
               success: false,
               message: "Invalid credentials",
           })
       }
       const token = jwt.sign({id: existMatch._id}, process.env.SECRET_KEY, { expiresIn: "1d" });

      return res.status(200).json({
          success: true,
          message: "Login successfully",
          token: token,
          data: existMatch,
      })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        })
    }
}

export default {
  register,
    login
};
